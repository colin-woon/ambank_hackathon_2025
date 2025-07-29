"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "An interactive pie chart"

interface ChartPieInteractiveProps {
  data: any[]
  chartConfig: ChartConfig
  title: string
  description: string
  dataKey: string
  nameKey: string
  id: string
  unitLabel?: string
}

export function ChartPieInteractive({
  data,
  chartConfig,
  title,
  description,
  dataKey,
  nameKey,
  id,
  unitLabel = "Total",
}: ChartPieInteractiveProps) {
  const [activeItem, setActiveItem] = React.useState(data[0]?.[nameKey])

  React.useEffect(() => {
    if (data.length > 0 && activeItem === undefined) {
      setActiveItem(data[0][nameKey])
    }
  }, [data, activeItem, nameKey])

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item[nameKey] === activeItem),
    [activeItem, data, nameKey]
  )

  if (data.length === 0) {
    return (
      <Card data-chart={id} className="flex flex-col h-full">
        <CardHeader className="items-start pb-0">
          <div className="grid gap-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center pb-0">
          <div className="text-muted-foreground">No data to display</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-chart={id} className="flex flex-col h-full">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="items-start pb-0">
        <div className="grid gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
              onMouseOver={(data) => {
                if (data.name !== activeItem) {
                  setActiveItem(data.name)
                }
              }}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const activeData = data[activeIndex]
                    if (!activeData) return null
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {activeData[dataKey].toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {unitLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}