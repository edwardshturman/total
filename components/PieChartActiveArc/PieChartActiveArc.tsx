"use client"

import * as React from "react"
import { PieChart } from "@mui/x-charts/PieChart"

interface PieChartDataEntry {
  label: string
  value: number
}

interface PieChartActiveArcProps {
  data: PieChartDataEntry[]
}

export function PieChartActiveArc(props: PieChartActiveArcProps) {
  const { data } = props
  const valueFormatter = (item: { value: number }) => `$${item.value}`
  return (
    <div>
      <PieChart
        series={[
          {
            data: data,
            highlightScope: { fade: "global", highlight: "item" },
            faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
            valueFormatter
          }
        ]}
        height={200}
        width={200}
        slotProps={{
          legend: {
            sx: {
              color: "white"
            }
          }
        }}
      />
    </div>
  )
}
