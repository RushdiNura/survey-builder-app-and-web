import React from "react";
import { View, Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useTheme } from "../theme/ThemeContext";

const screenWidth = Dimensions.get("window").width;

function chartConfig(theme) {
  const [r, g, b] = theme.isDark ?? false ? [129, 140, 248] : [79, 70, 229];
  return {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${r}, ${g}, ${b}, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.textMuted,
    propsForBackgroundLines: { stroke: theme.colors.chartGrid, strokeDasharray: "" },
    barPercentage: 0.6,
    propsForLabels: { fontSize: 10 },
  };
}

export function TrendChart({ trend }) {
  const { theme, isDark } = useTheme();
  const labels = trend.map((t) => t.date.slice(5)); // MM-DD
  const data = trend.map((t) => t.count);

  return (
    <View>
      <LineChart
        data={{ labels, datasets: [{ data: data.length ? data : [0] }] }}
        width={screenWidth - 72}
        height={200}
        bezier
        chartConfig={chartConfig({ ...theme, isDark })}
        withInnerLines
        withOuterLines={false}
        withShadow={false}
        style={{ borderRadius: 12, marginLeft: -16 }}
      />
    </View>
  );
}

export function BreakdownChart({ question }) {
  const { theme, isDark } = useTheme();
  if (!question.breakdown) return null;
  const labels = Object.keys(question.breakdown);
  const data = labels.map((l) => question.breakdown[l]);
  if (labels.length === 0) return null;

  return (
    <BarChart
      data={{ labels: labels.map((l) => (l.length > 8 ? `${l.slice(0, 7)}…` : l)), datasets: [{ data }] }}
      width={screenWidth - 72}
      height={180}
      fromZero
      chartConfig={chartConfig({ ...theme, isDark })}
      withInnerLines
      showValuesOnTopOfBars
      style={{ borderRadius: 12, marginLeft: -16 }}
    />
  );
}
