import Svg, { Rect, Text as SvgText, G, Line } from 'react-native-svg';
import { MonthlyBar } from '@/db/queries/statistics';
import { ThemeColors } from '@/constants/colors';

interface Props {
  data: MonthlyBar[];
  colors: ThemeColors;
  width: number;
  height?: number;
}

const LABEL_H = 24;
const H_PAD = 8;
const BAR_GAP = 4;
const RADIUS = 5;
const MIN_BAR_H = 3; // always render a stub so empty months are visible

export function BarChart({ data, colors, width, height = 180 }: Props) {
  const CHART_H = height - LABEL_H;
  const chartW = width - H_PAD * 2;
  const groupW = chartW / data.length;
  const barW = Math.max((groupW - BAR_GAP * 3) / 2, 5);

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const toH = (v: number) => (v > 0 ? Math.max((v / maxVal) * (CHART_H - 8), MIN_BAR_H) : 0);

  const gridPcts = [0.25, 0.5, 0.75, 1.0];

  return (
    <Svg width={width} height={height}>
      {/* Horizontal grid lines */}
      {gridPcts.map((p) => {
        const y = CHART_H - p * (CHART_H - 8);
        return (
          <Line
            key={p}
            x1={H_PAD}
            y1={y}
            x2={width - H_PAD}
            y2={y}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="3,5"
          />
        );
      })}

      {/* Baseline */}
      <Line
        x1={H_PAD}
        y1={CHART_H}
        x2={width - H_PAD}
        y2={CHART_H}
        stroke={colors.border}
        strokeWidth={1}
      />

      {data.map((d, i) => {
        const gx = H_PAD + i * groupW + BAR_GAP;
        const incH = toH(d.income);
        const expH = toH(d.expense);
        const labelX = gx + barW + BAR_GAP / 2;

        return (
          <G key={d.yearMonth}>
            {/* Income bar */}
            {d.income > 0 ? (
              <Rect
                x={gx}
                y={CHART_H - incH}
                width={barW}
                height={incH}
                rx={RADIUS}
                ry={RADIUS}
                fill={colors.success + 'BB'}
              />
            ) : (
              /* Zero stub */
              <Rect
                x={gx}
                y={CHART_H - MIN_BAR_H}
                width={barW}
                height={MIN_BAR_H}
                rx={2}
                fill={colors.border}
              />
            )}

            {/* Expense bar */}
            {d.expense > 0 ? (
              <Rect
                x={gx + barW + BAR_GAP}
                y={CHART_H - expH}
                width={barW}
                height={expH}
                rx={RADIUS}
                ry={RADIUS}
                fill={colors.primary + 'CC'}
              />
            ) : (
              <Rect
                x={gx + barW + BAR_GAP}
                y={CHART_H - MIN_BAR_H}
                width={barW}
                height={MIN_BAR_H}
                rx={2}
                fill={colors.border}
              />
            )}

            {/* Month label */}
            <SvgText
              x={labelX}
              y={height - 5}
              textAnchor="middle"
              fill={colors.textMuted}
              fontSize={10}
              fontFamily="Inter-Regular">
              {d.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
