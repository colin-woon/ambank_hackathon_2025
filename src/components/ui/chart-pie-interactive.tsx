"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"
import CountUp from "@/components/TextAnimations/CountUp/CountUp"

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
  // Filter out "closed" for Pie rendering
  const orderedStatuses = ["new", "investigating", "resolving", "monitoring"]
  const filteredData = data
    .filter((item) => item[nameKey] !== "closed")
    .sort((a, b) => orderedStatuses.indexOf(a[nameKey]) - orderedStatuses.indexOf(b[nameKey]))


  const [activeItem, setActiveItem] = React.useState(filteredData[0]?.[nameKey])

  React.useEffect(() => {
    if (filteredData.length > 0 && activeItem === undefined) {
      setActiveItem(filteredData[0][nameKey])
    }
  }, [filteredData, activeItem, nameKey])

  const activeIndex = React.useMemo(
    () => filteredData.findIndex((item) => item[nameKey] === activeItem),
    [activeItem, filteredData, nameKey]
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
        <div className="grid lg:text-5xl">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="lg:text-2xl">{description}</CardDescription>
        </div>
        <div className="grid lg:grid-cols-[1fr_1fr_1fr_1fr] grid-cols-4 lg:gap-5 place-items-center pt-5 -mb-5 w-full">
          {["new", "investigating", "resolving", "monitoring"]
            .map((status) => data.find((item) => item[nameKey] === status))
            .filter(Boolean)
            .map((item) => {
              const status = item[nameKey]
              const value = item[dataKey]
              const config = chartConfig[status] || {}
              const label = config.label || status.replace(/_/g, " ")
              const color = config.color

              return (
                <div key={status} className="flex flex-col items-center">
                  <CountUp
                    from={0}
                    to={value}
                    separator=","
                    direction="up"
                    duration={2}
                    className="count-up-text lg:text-4xl md:text-xl font-bold"
                    style={{ color }}
                  />
                  <p
                    className={`font-bold lg:text-m capitalize`}
                    style={{ color }}
                  >
                    {label}
                  </p>
                </div>
              )
            })}
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
              data={filteredData}
              dataKey={dataKey}
              nameKey={nameKey}
              startAngle={180}
              endAngle={-180}
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
                    const activeData = filteredData[activeIndex]
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
