import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs'
import TabBar from '../components/TabBar'
import Map from '../screens/MapScreen'
import HomeScreen from '../screens/HomeScreen'
import { usePreferences } from '../stores/preferences'
import Constants from 'expo-constants'
import { View } from 'react-native'
import WhatsNewSheet from '../components/WhatsNewSheet'
import { useEffect, useState } from 'react'
import DeveloperToolsScreen from '../screens/DeveloperToolsScreen'
import MonthScreen from '../screens/MonthScreen'
import YearScreen from '../screens/YearScreen'
import usePublisher from '../hooks/usePublisher'

export type HomeTabStackParamList = {
  Home: undefined
  Tools: undefined
  Month: { month?: number; year?: number }
  Year: { year?: number }
  Map: undefined
}

export type HomeTabStackNavigation =
  BottomTabNavigationProp<HomeTabStackParamList>
const HomeTabStack = () => {
  const Tab = createBottomTabNavigator<HomeTabStackParamList>()
  const { lastAppVersion, developerTools, set, publisher } = usePreferences()
  const { hasAnnualGoal } = usePublisher()
  const [lastVersion] = useState(lastAppVersion)
  const [showWhatsNew, setShowWhatsNew] = useState(false)

  useEffect(() => {
    const currentVersion = Constants.expoConfig?.version
    if (currentVersion !== lastAppVersion) {
      setShowWhatsNew(true)
      set({ lastAppVersion: currentVersion })
    }
  }, [lastAppVersion, set])

  return (
    <View style={{ flexGrow: 1 }}>
      {lastVersion && (
        <WhatsNewSheet
          lastVersion={lastVersion}
          show={showWhatsNew}
          setShow={setShowWhatsNew}
        />
      )}
      <Tab.Navigator
        initialRouteName='Home'
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ header: () => null }}
      >
        <Tab.Screen name='Home' component={HomeScreen} />
        {developerTools && (
          <Tab.Screen name='Tools' component={DeveloperToolsScreen} />
        )}
        {publisher !== 'publisher' && (
          <Tab.Screen name='Month' component={MonthScreen} />
        )}
        {hasAnnualGoal && <Tab.Screen name='Year' component={YearScreen} />}
        <Tab.Screen name='Map' component={Map} />
      </Tab.Navigator>
    </View>
  )
}

export default HomeTabStack
