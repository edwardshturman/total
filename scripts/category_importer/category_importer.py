import pandas as pd
import sqlalchemy as sa
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError
import logging
from datetime import datetime
import os
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CategoryImporter:
    def __init__(self, database_url: str):
        """
        Initialize the category importer

        Args:
            database_url: SQLAlchemy database URL (e.g., 'postgresql://user:pass@host/db')
        """
        self.engine = create_engine(database_url)

    def validate_csv(self, csv_file_path: str) -> bool:
        """
        Validate that the CSV has the required columns

        Args:
            csv_file_path: Path to the CSV file

        Returns:
            bool: True if valid, False otherwise
        """
        try:
            df = pd.read_csv(csv_file_path, nrows=1)
            required_columns = ['PRIMARY', 'DETAILED', 'DESCRIPTION']

            if not all(col in df.columns for col in required_columns):
                missing_cols = [col for col in required_columns if col not in df.columns]
                logger.error(f"Missing required columns: {missing_cols}")
                return False

            return True
        except Exception as e:
            logger.error(f"Error validating CSV: {e}")
            return False

    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and prepare the data for insertion

        Args:
            df: Raw dataframe from CSV

        Returns:
            pd.DataFrame: Cleaned dataframe
        """
        # Strip whitespace from all string columns
        string_columns = ['PRIMARY', 'DETAILED', 'DESCRIPTION']
        for col in string_columns:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip()

        # Remove rows where required fields are empty or NaN
        df = df.dropna(subset=['PRIMARY', 'DETAILED'], how='any')

        # Fill empty descriptions with empty string
        df['DESCRIPTION'] = df['DESCRIPTION'].fillna('')

        # Remove duplicate combinations of PRIMARY + DETAILED
        df = df.drop_duplicates(subset=['PRIMARY', 'DETAILED'])

        return df

    def get_or_create_primary_category(self, conn, name: str) -> str:
        """
        Get existing primary category ID or create new one

        Args:
            conn: Database connection
            name: Primary category name

        Returns:
            str: Primary category ID (UUID)
        """
        # Check if primary category already exists
        result = conn.execute(
            text("SELECT id FROM \"PrimaryTransactionCategory\" WHERE name = :name"),
            {"name": name}
        ).fetchone()

        if result:
            return result[0]

        # Create new primary category
        primary_id = str(uuid.uuid4())
        conn.execute(
            text('INSERT INTO "PrimaryTransactionCategory" (id, name) VALUES (:id, :name)'),
            {"id": primary_id, "name": name}
        )
        logger.debug(f"Created primary category: {name} (ID: {primary_id})")
        return primary_id

    def insert_detailed_category(self, conn, primary_id: str, name: str, description: str) -> bool:
        """
        Insert detailed category

        Args:
            conn: Database connection
            primary_id: Primary category ID
            name: Detailed category name
            description: Category description

        Returns:
            bool: True if inserted, False if already exists
        """
        try:
            detailed_id = str(uuid.uuid4())
            conn.execute(
                text('''INSERT INTO "DetailedTransactionCategory"
                        (id, "primaryTransactionCategoryId", name, description)
                        VALUES (:id, :primary_id, :name, :description)'''),
                {
                    "id": detailed_id,
                    "primary_id": primary_id,
                    "name": name,
                    "description": description if description else None
                }
            )
            logger.debug(f"Created detailed category: {name} (ID: {detailed_id})")
            return True
        except IntegrityError as e:
            if "unique" in str(e).lower():
                logger.debug(f"Detailed category already exists: {name}")
                return False
            else:
                raise e

    def insert_categories(self, df: pd.DataFrame) -> dict:
        """
        Insert categories into the database

        Args:
            df: Cleaned dataframe with category data

        Returns:
            dict: Summary of insertion results
        """
        results = {
            'total_processed': len(df),
            'primary_categories_created': 0,
            'primary_categories_existing': 0,
            'detailed_categories_created': 0,
            'detailed_categories_existing': 0,
            'errors': 0
        }

        try:
            with self.engine.begin() as conn:  # Use transaction
                primary_cache = {}  # Cache primary category IDs

                for index, row in df.iterrows():
                    try:
                        primary_name = row['PRIMARY']
                        detailed_name = row['DETAILED']
                        description = row['DESCRIPTION']

                        # Get or create primary category (use cache to avoid duplicate queries)
                        if primary_name not in primary_cache:
                            # Check if it exists first
                            existing_result = conn.execute(
                                text('SELECT id FROM "PrimaryTransactionCategory" WHERE name = :name'),
                                {"name": primary_name}
                            ).fetchone()

                            if existing_result:
                                primary_cache[primary_name] = existing_result[0]
                                results['primary_categories_existing'] += 1
                            else:
                                # Create new primary category
                                primary_id = str(uuid.uuid4())
                                conn.execute(
                                    text('INSERT INTO "PrimaryTransactionCategory" (id, name) VALUES (:id, :name)'),
                                    {"id": primary_id, "name": primary_name}
                                )
                                primary_cache[primary_name] = primary_id
                                results['primary_categories_created'] += 1
                                logger.info(f"Created primary category: {primary_name}")

                        primary_id = primary_cache[primary_name]

                        # Insert detailed category
                        detailed_inserted = self.insert_detailed_category(
                            conn, primary_id, detailed_name, description
                        )

                        if detailed_inserted:
                            results['detailed_categories_created'] += 1
                        else:
                            results['detailed_categories_existing'] += 1

                    except Exception as e:
                        results['errors'] += 1
                        logger.error(f"Error processing row {index}: {e}")
                        logger.error(f"Row data: Primary='{row['PRIMARY']}', Detailed='{row['DETAILED']}'")

        except Exception as e:
            logger.error(f"Database transaction error: {e}")
            raise

        return results

    def import_csv(self, csv_file_path: str) -> dict:
        """
        Main method to import CSV data into the database

        Args:
            csv_file_path: Path to the CSV file (relative or absolute)

        Returns:
            dict: Summary of import results
        """
        # Convert to absolute path and validate file exists
        abs_csv_path = os.path.abspath(csv_file_path)
        if not os.path.exists(abs_csv_path):
            raise FileNotFoundError(f"CSV file not found: {abs_csv_path} (original: {csv_file_path})")

        # Validate CSV structure
        if not self.validate_csv(abs_csv_path):
            raise ValueError("CSV validation failed")

        # Read CSV
        logger.info(f"Reading CSV file: {abs_csv_path}")
        df = pd.read_csv(abs_csv_path)
        logger.info(f"Read {len(df)} rows from CSV")

        # Clean data
        df_clean = self.clean_data(df)
        logger.info(f"After cleaning: {len(df_clean)} rows to process")

        # Insert data
        results = self.insert_categories(df_clean)

        # Log summary
        logger.info(f"Import completed:")
        logger.info(f"  Total processed: {results['total_processed']}")
        logger.info(f"  Primary categories created: {results['primary_categories_created']}")
        logger.info(f"  Primary categories existing: {results['primary_categories_existing']}")
        logger.info(f"  Detailed categories created: {results['detailed_categories_created']}")
        logger.info(f"  Detailed categories existing: {results['detailed_categories_existing']}")
        logger.info(f"  Errors: {results['errors']}")

        return results


def main():
    """
    Example usage of the CategoryImporter for PostgreSQL with Prisma schema
    """
    # PostgreSQL database configuration
    DATABASE_URL = os.environ['DATABASE_URL']
    if not DATABASE_URL:
      logger.error(f"DATABASE_URL environment variable not set!")
      return

    # CSV file path (relative to script location)
    CSV_FILE_PATH = "./scripts/category_importer/categories.csv"

    try:
        # Initialize importer
        importer = CategoryImporter(DATABASE_URL)

        # Import categories
        results = importer.import_csv(CSV_FILE_PATH)

        print("\n=== Import Summary ===")
        print(f"Total processed: {results['total_processed']}")
        print(f"Primary categories created: {results['primary_categories_created']}")
        print(f"Primary categories existing: {results['primary_categories_existing']}")
        print(f"Detailed categories created: {results['detailed_categories_created']}")
        print(f"Detailed categories existing: {results['detailed_categories_existing']}")
        print(f"Errors: {results['errors']}")

    except Exception as e:
        logger.error(f"Import failed: {e}")
        raise


if __name__ == "__main__":
    main()
