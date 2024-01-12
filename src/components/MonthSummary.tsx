import { View } from 'react-native'
import Button from './Button'
import Text from './MyText'
import i18n from '../lib/locales'
import Divider from './Divider'
import MonthServiceReportProgressBar from './MonthServiceReportProgressBar'
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons'
import IconButton from './IconButton'
import {
  ldcHoursForSpecificMonth,
  otherHoursForSpecificMonth,
  standardHoursForSpecificMonth,
  totalHoursForSpecificMonth,
} from '../lib/serviceReport'
import { useMemo, useState } from 'react'
import useTheme from '../contexts/theme'
import { ExportTimeSheetState } from './ExportTimeSheet'
import { ServiceReport } from '../types/serviceReport'
import TimeCategoryTableRow from './TimeCategoryTableRow'
import { usePreferences } from '../stores/preferences'
import Card from './Card'
import ActionButton from './ActionButton'
import { useNavigation } from '@react-navigation/native'
import { RootStackNavigation } from '../stacks/RootStack'

interface MonthSummaryProps {
  monthsReports: ServiceReport[] | null
  month: number
  year: number
  setSheet: React.Dispatch<React.SetStateAction<ExportTimeSheetState>>
}

const MonthSummary = ({
  monthsReports,
  month,
  year,
  setSheet,
}: MonthSummaryProps) => {
  const theme = useTheme()
  const { publisher, publisherHours } = usePreferences()
  const [expandOtherCategories, setExpandOtherCategories] = useState(false)
  const goalHours = publisherHours[publisher]
  const navigation = useNavigation<RootStackNavigation>()

  const totalHours = useMemo(
    () =>
      monthsReports
        ? totalHoursForSpecificMonth(monthsReports, month, year)
        : 0,
    [month, monthsReports, year]
  )

  const ldcHours = useMemo(
    () =>
      monthsReports ? ldcHoursForSpecificMonth(monthsReports, month, year) : 0,
    [month, monthsReports, year]
  )

  const standardHours = useMemo(
    () =>
      monthsReports
        ? standardHoursForSpecificMonth(monthsReports, month, year)
        : 0,
    [month, monthsReports, year]
  )

  const otherHours = useMemo(
    () =>
      monthsReports
        ? otherHoursForSpecificMonth(monthsReports, month, year)
        : null,
    [month, monthsReports, year]
  )

  if (!monthsReports) {
    return (
      <Card>
        <Text
          style={{
            fontFamily: theme.fonts.semiBold,
          }}
        >
          {i18n.t('noTimeReports')}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSize('sm'),
            color: theme.colors.textAlt,
          }}
        >
          {i18n.t('noTimeReports_description')}
        </Text>
        <ActionButton
          onPress={() => navigation.navigate('Add Time', { month, year })}
        >
          <Text
            style={{
              textAlign: 'center',
              flex: 1,
              color: theme.colors.textInverse,
            }}
          >
            {i18n.t('addTime')}
          </Text>
        </ActionButton>
      </Card>
    )
  }

  return (
    <View style={{ gap: 3 }}>
      <Card>
        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              justifyContent: 'space-between',
              marginBottom: 3,
            }}
          >
            <Text
              style={{
                fontFamily: theme.fonts.semiBold,
                fontSize: theme.fontSize('xl'),
              }}
            >
              {i18n.t('monthDetails')}
            </Text>
            <IconButton
              iconStyle={{ color: theme.colors.accent }}
              onPress={() =>
                setSheet({
                  open: true,
                  month: month,
                  year,
                })
              }
              icon={faArrowUpFromBracket}
            />
          </View>
          <View style={{ gap: 5 }}>
            <Text
              style={{
                textAlign: 'right',
                color: theme.colors.textAlt,
                fontFamily: theme.fonts.semiBold,
              }}
            >
              {' '}
              {`${totalHours} ${i18n.t('of')} ${goalHours} ${i18n.t(
                'hoursToGoal'
              )}`}{' '}
            </Text>
            <MonthServiceReportProgressBar month={month} year={year} />
          </View>
        </View>
        <View style={{ gap: 5 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: theme.fonts.semiBold,
                color: theme.colors.textAlt,
              }}
            >
              {i18n.t('categories')}
            </Text>
            <Text
              style={{
                fontFamily: theme.fonts.semiBold,
                color: theme.colors.textAlt,
              }}
            >
              {i18n.t('hours')}
            </Text>
          </View>
          <Divider />
          <View style={{ gap: 10 }}>
            <TimeCategoryTableRow
              title={i18n.t('standard')}
              number={standardHours}
            />
            <TimeCategoryTableRow title={i18n.t('ldc')} number={ldcHours} />
            {otherHours && otherHours.length > 0 && (
              <>
                {!expandOtherCategories && (
                  <Button onPress={() => setExpandOtherCategories(true)}>
                    <Text
                      style={{
                        textDecorationLine: 'underline',
                        color: theme.colors.textAlt,
                        fontSize: theme.fontSize('sm'),
                      }}
                    >
                      {i18n.t('showOtherCategories')}
                    </Text>
                  </Button>
                )}
                {expandOtherCategories &&
                  otherHours.map((report, index) => (
                    <TimeCategoryTableRow
                      key={index}
                      title={report.tag}
                      number={report.hours}
                    />
                  ))}
              </>
            )}
          </View>
        </View>
      </Card>
    </View>
  )
}
export default MonthSummary