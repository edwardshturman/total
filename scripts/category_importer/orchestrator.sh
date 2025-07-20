#bin/bash

BASE_PATH="scripts/category_importer"

# Create virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r "$BASE_PATH/requirements.txt"

# Execute the script
python3 "$BASE_PATH/category_importer.py"

# Remove the virtual environment when finished
rm -rf .venv
