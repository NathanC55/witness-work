import { Calendar } from 'react-native-calendars'
import { ServiceReport } from '../types/serviceReport'
import moment from 'moment'
import useTheme from '../contexts/theme'
import { MarkedDates } from 'react-native-calendars/src/types'

type MonthTimeReportsCalendarProps = {
  month: number
  year: number
  monthsReports: ServiceReport[] | null
}

const MonthTimeReportsCalendar: React.FC<MonthTimeReportsCalendarProps> = ({
  month,
  year,
  monthsReports,
}) => {
  const theme = useTheme()
  const monthToView = moment().month(month).year(year).format('YYYY-MM-DD')

  const markedDates: MarkedDates = (() => {
    if (monthsReports === null) {
      return {}
    }

    const markedDates: MarkedDates = {}

    monthsReports.forEach((report) => {
      const date = moment(report.date).format('YYYY-MM-DD')
      markedDates[date] = { marked: true, dotColor: theme.colors.accent }
    })

    return markedDates
  })()

  return (
    <Calendar
      key={monthToView}
      current={monthToView}
      disableMonthChange
      hideArrows
      renderHeader={() => undefined}
      style={{
        borderRadius: theme.numbers.borderRadiusLg,
        paddingBottom: 10,
        paddingTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
      }}
      markedDates={markedDates}
      markingType='custom'
      theme={{
        backgroundColor: theme.colors.card,
        calendarBackground: theme.colors.card,
        dayTextColor: theme.colors.text,
        textDisabledColor: theme.colors.textAlt,
        textDayHeaderFontSize: theme.fontSize('md'),
        selectedDayBackgroundColor: theme.colors.accent,
        todayTextColor: theme.colors.text,
        todayBackgroundColor: theme.colors.accentTranslucent,
      }}
    />
  )
}

export default MonthTimeReportsCalendar
