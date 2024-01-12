import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack'
import ContactFormScreen from '../screens/ContactFormScreen'
import Header from '../components/layout/Header'
import ConversationFormScreen from '../screens/ConversationFormScreen'
import ContactSelectorScreen from '../screens/ContactSelectorScreen'
import useTheme from '../contexts/theme'
import ContactDetailsScreen from '../screens/ContactDetailsScreen'
import AddTimeScreen from '../screens/AddTimeScreen'
import TimeReportsScreen from '../screens/TimeReportsScreen'
import RecoverContactsScreen from '../screens/RecoverContactsScreen'
import OnBoarding from '../components/onboarding/Onboarding'
import { usePreferences } from '../stores/preferences'
import UpdateScreen from '../screens/UpdateScreen'
import IconButton from '../components/IconButton'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import HomeTabStack from './HomeTabStack'
import PreferencesScreen from '../screens/settings/preferences/PreferencesScreen'
import i18n from '../lib/locales'
import WhatsNewScreen from '../screens/WhatsNewScreen'
import DonationInfoScreen from '../screens/DonationInfoScreen'
import PaywallScreen from '../screens/PaywallScreen'
import PaywallThankYouScreen from '../screens/PaywallThankYouScreen'

export type RootStackParamList = {
  Root: undefined
  'Conversation Form': {
    contactId?: string
    conversationToEditId?: string
    notAtHome?: boolean
  }
  'Contact Details': { id: string; highlightedConversationId?: string } // Contact ID
  'Contact Form': { id: string; edit?: boolean } // Contact ID
  'Contact Selector': undefined
  'Add Time': { month?: number; year?: number } | undefined
  'Time Reports': { month?: number; year?: number }
  'Recover Contacts': undefined
  Onboarding: undefined
  Update: undefined
  Preferences: undefined
  'Whats New': undefined
  Donate: undefined
  Paywall: undefined
  'Thank You': undefined
}

export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>
const RootStack = createNativeStackNavigator<RootStackParamList>()

const RootStackComponent = () => {
  const theme = useTheme()
  const { onboardingComplete } = usePreferences()

  return (
    <RootStack.Navigator>
      {/* 
      Cannot render onboarding via Navigator initialRouteName. 
      This alternative allows for dynamically rendering screen. 
      Navigating directly between conditional screens causes an error
      because from each screen's perspective the other screen does not exist. 
      You must update the variable instead. 
      See: https://github.com/react-navigation/react-navigation/discussions/10346
      */}
      {onboardingComplete ? (
        <RootStack.Screen
          options={{ header: () => undefined }}
          name='Root'
          component={HomeTabStack}
        />
      ) : (
        <RootStack.Screen
          options={{ header: () => undefined }}
          name='Onboarding'
          component={OnBoarding}
        />
      )}
      <RootStack.Screen
        name='Contact Details'
        component={ContactDetailsScreen}
      />
      <RootStack.Screen name='Contact Form' component={ContactFormScreen} />
      <RootStack.Screen
        name='Conversation Form'
        component={ConversationFormScreen}
      />
      <RootStack.Screen
        name='Contact Selector'
        component={ContactSelectorScreen}
        options={{
          presentation: 'formSheet',
          header: () => <Header noInsets buttonType='exit' />,
        }}
      />
      <RootStack.Screen
        name='Add Time'
        options={{
          presentation: 'modal',
          header: () => <Header noInsets buttonType='back' />,
        }}
        component={AddTimeScreen}
      />
      <RootStack.Screen
        options={{
          header: ({ navigation }) => (
            <Header
              buttonType='back'
              title={i18n.t('timeReports')}
              rightElement={
                <IconButton
                  style={{ position: 'absolute', right: 0 }}
                  icon={faPlus}
                  onPress={() => navigation.navigate('Add Time')}
                  size='xl'
                  iconStyle={{ color: theme.colors.text }}
                />
              }
            />
          ),
        }}
        name='Time Reports'
        component={TimeReportsScreen}
      />
      <RootStack.Screen
        options={{
          presentation: 'modal',
          header: () => <Header noInsets buttonType='back' title='' />,
        }}
        name='Recover Contacts'
        component={RecoverContactsScreen}
      />
      <RootStack.Screen
        options={{ header: () => null }}
        name='Update'
        component={UpdateScreen}
      />
      <RootStack.Screen
        options={{
          header: () => (
            <Header buttonType='back' title={i18n.t('preferences')} />
          ),
        }}
        name='Preferences'
        component={PreferencesScreen}
      />
      <RootStack.Screen
        options={{
          header: () => <Header buttonType='back' title={i18n.t('whatsNew')} />,
        }}
        name='Whats New'
        component={WhatsNewScreen}
      />
      <RootStack.Screen
        options={{
          header: () => <Header buttonType='back' title={''} />,
        }}
        name='Donate'
        component={DonationInfoScreen}
      />
      <RootStack.Screen
        options={{
          header: () => <Header buttonType='back' title={i18n.t('donate')} />,
        }}
        name='Paywall'
        component={PaywallScreen}
      />
      <RootStack.Screen
        options={{
          header: () => null,
        }}
        name='Thank You'
        component={PaywallThankYouScreen}
      />
    </RootStack.Navigator>
  )
}

export default RootStackComponent
