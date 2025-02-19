// nuxt 下不能用 import 引入整个依赖，只能用 plugin 的方式引入

import { chartHeight } from './incomeUtil'

// This function is HARD_CODED
function showRangeAndAnnotations(credit, checkAllGroupRange, chart) {
  // 优化：调整画布范围仅在需要显示标注时固定范围，如果没有标注，则允许自由伸缩
  let chartMin = 1000
  let chartMax = 0
  let shouldFixScale = false

  // 计算并绘制分界线
  let minD = '9999-12-31'
  let maxD = '0000-01-01'
  for (const c of credit) {
    if (c.date > maxD) {
      maxD = c.date
    }
    if (c.date < minD) {
      minD = c.date
    }
  }

  if (checkAllGroupRange.includes('芝麻信用')) {
    chartMin = Math.min(chartMin, 350)
    chartMax = Math.max(chartMax, 950)
    shouldFixScale = true

    const score = [350, 550, 600, 650, 700]
    const text = ['较差', '中等', '良好', '优秀', '极好']

    for (let i = 0; i < 5; i++) {
      chart.annotation().line({
        top: true,
        start: [minD, score[i]],
        end: [maxD, score[i]],
        style: {
          stroke: '#1574F7',
          lineWidth: 1,
          lineDash: [3, 3],
        },
        text: {
          position: 'start',
          style: {
            fill: '#1574F7',
            fontSize: 12,
            fontWeight: 300,
          },
          content: `${text[i]} - 芝麻信用`,
          offsetY: -5,
        },
      })
    }
  }

  if (checkAllGroupRange.includes('微信支付分')) {
    chartMin = Math.min(chartMin, 350)
    chartMax = Math.max(chartMax, 950)
    shouldFixScale = true

    const score = [350, 550, 600, 650, 700]
    const text = ['较差', '中等', '良好', '优秀', '极好']

    for (let i = 0; i < 5; i++) {
      chart.annotation().line({
        top: true,
        start: [minD, score[i]],
        end: [maxD, score[i]],
        style: {
          stroke: '#1AAD19',
          lineWidth: 1,
          lineDash: [3, 3],
        },
        text: {
          position: 'end',
          style: {
            fill: '#1AAD19',
            fontSize: 12,
            fontWeight: 300,
          },
          content: `${text[i]} - 微信支付分`,
          offsetY: -5,
        },
      })
    }
  }

  if (checkAllGroupRange.includes('VantageScore 3.0')) {
    chartMin = Math.min(chartMin, 300)
    chartMax = Math.max(chartMax, 850)
    shouldFixScale = true

    const score = [300, 500, 601, 661, 781]
    const text = ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']

    for (let i = 0; i < 5; i++) {
      chart.annotation().line({
        top: true,
        start: [minD, score[i]],
        end: [maxD, score[i]],
        style: {
          stroke: '#F15F22',
          lineWidth: 1,
          lineDash: [3, 3],
        },
        text: {
          position: 'end',
          style: {
            fill: '#F15F22',
            fontSize: 12,
            fontWeight: 300,
          },
          content: `${text[i]} - VantageScore 3.0`,
          offsetY: -5,
        },
      })
    }
  }

  if (checkAllGroupRange.includes('FICO Score 8')) {
    chartMin = Math.min(chartMin, 300)
    chartMax = Math.max(chartMax, 850)
    shouldFixScale = true

    const score = [300, 580, 670, 740, 800]
    const text = ['Poor', 'Fair', 'Good', 'Very Good', 'Exceptional']

    for (let i = 0; i < 5; i++) {
      chart.annotation().line({
        top: true,
        start: [minD, score[i]],
        end: [maxD, score[i]],
        style: {
          stroke: '#00609C',
          lineWidth: 1,
          lineDash: [3, 3],
        },
        text: {
          position: 'start',
          style: {
            fill: '#00609C',
            fontSize: 12,
            fontWeight: 300,
          },
          content: `${text[i]} - FICO Score 8`,
          offsetY: -5,
        },
      })
    }
  }

  if (checkAllGroupRange.includes('FICO BankCard Score 8')) {
    chartMin = Math.min(chartMin, 250)
    chartMax = Math.max(chartMax, 900)
    shouldFixScale = true
  }

  if (checkAllGroupRange.includes('FICO Auto Score 8')) {
    chartMin = Math.min(chartMin, 250)
    chartMax = Math.max(chartMax, 900)
    shouldFixScale = true
  }

  // 调整画布范围
  if (shouldFixScale) {
    chart.scale('score', {
      min: chartMin,
      max: chartMax,
    })
    // 如果固定了画布，就不能移除图例数据了，所以要禁用交互
    chart.legend(true) // 仍然需要图例来看不同的颜色
    chart.removeInteraction('legend-filter') // 但是禁用交互
  }
}

export function renderChartForCredit(that, credit, checkboxes) {
  const [checkAllGroupSource, checkAllGroupModel, checkAllGroupRange] =
    checkboxes

  credit = credit.filter((e) => {
    return (
      checkAllGroupSource.includes(e.source) &&
      checkAllGroupModel.includes(e.model)
    )
  })

  if (credit.length === 0) {
    return null
  }

  const { Chart } = that.$g2
  const chart = new Chart({
    container: 'credit-score',
    forceFit: true,
    autoFit: true,
    height: chartHeight(),
  })

  for (const c of credit) {
    c.name = `${c.source} + ${c.model}`
  }

  chart.data(credit)

  chart.tooltip({
    showCrosshairs: true,
    shared: true,
  })

  chart.scale('date', {
    nice: true,
    type: 'time', // 连续的时间类型，是一种特殊的连续性数据，也是 linear 的子类
  })

  chart.scale('score', {
    nice: true,
  })

  chart.axis('score', {
    label: {
      formatter: (val) => {
        return parseInt(val, 10)
      },
    },
  })

  chart.line().position('date*score').color('name') // 信用分不平滑，因为日期密度比较高

  // chart.point().position('date*score').color('name').shape('circle').style({
  //   stroke: '#fff',
  //   lineWidth: 1,
  // }) // 收入一年一个数据点可以画点，信用分就只画线，因为日期密度高

  // chart.removeInteraction('legend-filter') // 移除默认的 legend-filter 数据过滤交互
  // chart.interaction('legend-visible-filter') // 使用分类图例的图形过滤

  // 开启缩略轴组件
  chart.option('slider', {
    // 组件高度
    height: 30,
    // 滑块背景趋势图配置
    trendCfg: {
      // 	趋势图曲线是否圆滑
      smooth: true,
      // 	趋势图是否使用面积图
      isArea: true,
    },
  })

  // Show Range And Annotations
  showRangeAndAnnotations(credit, checkAllGroupRange, chart)

  chart.render()
  return chart
}
