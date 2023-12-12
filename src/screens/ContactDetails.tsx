import {
  View,
  Linking,
  Platform,
  Alert,
  ScrollView,
  useColorScheme,
} from 'react-native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Text from '../components/MyText'
import useTheme from '../contexts/theme'
import { RootStackNavigation, RootStackParamList } from '../stacks/RootStack'
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack'
import useContacts from '../stores/contactsStore'
import Header from '../components/layout/Header'
import CardWithTitle from '../components/CardWithTitle'
import { Address, Contact } from '../types/contact'
import { FlashList } from '@shopify/flash-list'
import ConversationRow from '../components/ConversationRow'
import useConversations from '../stores/conversationStore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Divider from '../components/Divider'
import moment from 'moment'
import i18n from '../lib/locales'
import {
  contactHasAtLeastOneStudy,
  contactMostRecentStudy,
  contactStudiedForGivenMonth,
} from '../lib/conversations'
import { Conversation } from '../types/conversation'
import Wrapper from '../components/Wrapper'
import { StatusBar } from 'expo-status-bar'
import IconButton from '../components/IconButton'
import {
  faBook,
  faCaravan,
  faComment,
  faComments,
  faEnvelope,
  faLocationDot,
  faPencil,
  faPhone,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import Copyeable from '../components/Copyeable'
import Button from '../components/Button'
import { parsePhoneNumber } from 'awesome-phonenumber'
import { useNavigation } from '@react-navigation/native'
import { getLocales } from 'expo-localization'
import { Sheet } from 'tamagui'

type Props = NativeStackScreenProps<RootStackParamList, 'Contact Details'>

const PhoneRow = ({ contact }: { contact: Contact }) => {
  const theme = useTheme()
  const navigation = useNavigation<RootStackNavigation>()
  const { phone } = contact
  const locales = getLocales()

  const formatted = useMemo(
    () =>
      parsePhoneNumber(phone || '', {
        regionCode: contact.phoneRegionCode || locales[0].regionCode || '',
      }),
    [contact.phoneRegionCode, locales, phone]
  )

  const isValid = formatted.valid

  const alertInvalidPhone = useCallback(() => {
    Alert.alert(
      i18n.t('invalidPhone'),
      `"${formatted.number?.input}" ${i18n.t('invalidPhone_description')} ${
        formatted.regionCode
      }.`,
      [
        { style: 'cancel', text: i18n.t('cancel') },
        {
          style: 'default',
          text: i18n.t('edit'),
          onPress: () =>
            navigation.replace('Contact Form', {
              id: contact.id,
              edit: true,
            }),
        },
      ]
    )
  }, [contact.id, formatted.number?.input, formatted.regionCode, navigation])

  if (!phone) {
    return
  }
  const handleCall = () => {
    if (isValid) {
      Linking.openURL(`tel:${formatted.number.e164}`)
    } else alertInvalidPhone()
  }

  const handleMessage = () => {
    if (isValid) {
      Linking.openURL(`sms:${formatted.number.e164}`)
    } else alertInvalidPhone()
  }

  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          fontSize: 14,
          fontFamily: theme.fonts.semiBold,
          color: theme.colors.textAlt,
        }}
      >
        {i18n.t('phone')}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Copyeable textProps={{ onPress: handleCall }}>
          {formatted.number?.international}
        </Copyeable>
        <View
          style={{
            flexDirection: 'row',
            gap: 25,
            alignItems: 'center',
          }}
        >
          <IconButton
            icon={faPhone}
            size='lg'
            iconStyle={{ color: theme.colors.accent }}
            onPress={handleCall}
          />
          <IconButton
            icon={faComment}
            size='lg'
            iconStyle={{ color: theme.colors.accent }}
            onPress={handleMessage}
          />
        </View>
      </View>
    </View>
  )
}

const Hero = ({
  name,
  isBibleStudy: isActiveBibleStudy,
  hasStudiedPreviously,
  mostRecentStudy,
}: {
  name: string
  isBibleStudy?: boolean
  hasStudiedPreviously?: boolean
  mostRecentStudy: Conversation | null
}) => {
  const theme = useTheme()

  return (
    <View
      style={{
        paddingVertical: 100,
        gap: 8,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontFamily: theme.fonts.semiBold,
          color: theme.colors.textInverse,
        }}
      >
        {i18n.t('contact')}
      </Text>
      <Copyeable
        textProps={{
          style: {
            fontSize: 40,
            fontFamily: theme.fonts.bold,
            color: theme.colors.textInverse,
          },
        }}
      >
        {name}
      </Copyeable>
      {hasStudiedPreviously && mostRecentStudy && (
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: theme.fonts.regular,
              color: theme.colors.textInverse,
            }}
          >
            {isActiveBibleStudy
              ? i18n.t('isStudying')
              : `${i18n.t('lastStudied')} ${moment(mostRecentStudy.date).format(
                  'L'
                )}`}
          </Text>
          <IconButton
            icon={faBook}
            iconStyle={{ color: theme.colors.textInverse }}
          />
        </View>
      )}
      {!isActiveBibleStudy && hasStudiedPreviously && (
        <Text
          style={{
            fontSize: theme.fontSize('sm'),
            color: theme.colors.textInverse,
            maxWidth: 250,
          }}
        >
          {i18n.t('inactiveBibleStudiesDoNoCountTowardsMonthlyTotals')}
        </Text>
      )}
    </View>
  )
}

const AddressRow = ({ contact }: { contact: Contact }) => {
  const theme = useTheme()
  const { address } = contact

  const navigateTo = useCallback((a: Address) => {
    const scheme = Platform.select({
      ios: 'maps://0,0?q=',
      android: 'geo:0,0?q=',
    })
    const address = `${
      a.line1
    }${` ${a.line2}`}${` ${a.city}`}${`, ${a.state}`}${` ${a.zip}`}`
    const url = Platform.select({
      ios: `${scheme}${address}`,
      android: `${scheme}${address}`,
    })
    if (!url) {
      return
    }
    Linking.openURL(url)
  }, [])

  if (!address) {
    return null
  }

  const addressAsSingleString = Object.keys(address).reduce(
    (prev, line, index) =>
      !address[line as keyof Address]?.length
        ? prev
        : (prev += `${index !== 0 ? ' ' : ''}${
            address[line as keyof Address]
          }`),
    ''
  )

  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          fontSize: 14,
          fontFamily: theme.fonts.semiBold,
          color: theme.colors.textAlt,
        }}
      >
        {i18n.t('address')}
      </Text>

      <Button onPress={() => navigateTo(address)}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Copyeable
            text={addressAsSingleString}
            onPress={() => navigateTo(address)}
          >
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              {Object.keys(address).map((key) => {
                if (address[key as keyof Address]) {
                  return <Text key={key}>{address[key as keyof Address]}</Text>
                }
              })}
            </View>
          </Copyeable>
          <IconButton
            size='lg'
            iconStyle={{ color: theme.colors.accent }}
            icon={faLocationDot}
          />
        </View>
      </Button>
    </View>
  )
}

const EmailRow = ({ contact }: { contact: Contact }) => {
  const theme = useTheme()
  const { email } = contact
  if (!email) {
    return null
  }

  const openMail = async () => {
    try {
      await Linking.openURL(`mailTo:${email}`)
    } catch (error) {
      Alert.alert(i18n.t('error'), i18n.t('failedToOpenMailApplication'))
    }
  }

  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          fontSize: 14,
          fontFamily: theme.fonts.semiBold,
          color: theme.colors.textAlt,
        }}
      >
        {i18n.t('email')}
      </Text>
      <Button onPress={openMail}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Copyeable>{email}</Copyeable>
          </View>
          <IconButton
            size='lg'
            iconStyle={{ color: theme.colors.accent }}
            icon={faEnvelope}
          />
        </View>
      </Button>
    </View>
  )
}

const DeleteContactButton = ({
  contact,
  deleteContact,
  navigation,
  contactId,
}: {
  deleteContact: (id: string) => void
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'Contact Details',
    undefined
  >
  contactId: string
  contact: Contact
}) => {
  const theme = useTheme()

  return (
    <View style={{ gap: 5 }}>
      <Button
        onPress={() =>
          Alert.alert(
            i18n.t('archiveContact_question'),
            i18n.t('archiveContact_description'),
            [
              {
                text: i18n.t('cancel'),
                style: 'cancel',
              },
              {
                text: i18n.t('delete'),
                style: 'destructive',
                onPress: () => {
                  deleteContact(contactId)
                  navigation.popToTop()
                },
              },
            ]
          )
        }
      >
        <Text
          style={{
            fontFamily: theme.fonts.semiBold,
            textAlign: 'center',
            fontSize: 10,
            textDecorationLine: 'underline',
          }}
        >
          {i18n.t('archiveContact')}
        </Text>
      </Button>
      <Text
        style={{
          fontSize: 10,
          color: theme.colors.textAlt,
          textAlign: 'center',
        }}
      >
        {i18n.t('created')} {moment(contact.createdAt).format('LL')}
      </Text>
    </View>
  )
}

interface AddSheetProps {
  sheetOpen: boolean
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'Contact Details',
    undefined
  >
  contact: Contact
}

const AddSheet = ({
  sheetOpen,
  setSheetOpen,
  navigation,
  contact,
}: AddSheetProps) => {
  const theme = useTheme()

  const handleAction = (action: 'notAtHome' | 'conversation') => {
    if (action === 'notAtHome') {
      navigation.replace('Conversation Form', {
        contactId: contact?.id,
        notAtHome: true,
      })
    }
    if (action === 'conversation') {
      navigation.replace('Conversation Form', {
        contactId: contact?.id,
      })
    }

    setSheetOpen(false)
  }

  return (
    <Sheet
      open={sheetOpen}
      onOpenChange={setSheetOpen}
      dismissOnSnapToBottom
      snapPoints={[55]}
      modal
    >
      <Sheet.Handle />
      <Sheet.Overlay zIndex={100_000 - 1} />
      <Sheet.Frame>
        <View style={{ gap: 15, padding: 30 }}>
          <View style={{ gap: 10 }}>
            <Text
              style={{
                fontSize: theme.fontSize('xl'),
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
              }}
            >
              {i18n.t('addToHistory')}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize('sm'),
                marginBottom: 15,
                color: theme.colors.text,
              }}
            >
              {i18n.t('add_description')}
            </Text>
          </View>
          <Button
            style={{ gap: 10 }}
            variant='outline'
            onPress={async () => handleAction('notAtHome')}
          >
            <IconButton
              iconStyle={{ color: theme.colors.text }}
              icon={faCaravan}
            />
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.fontSize('md'),
              }}
            >
              {i18n.t('notAtHome')}
            </Text>
          </Button>
          <Button
            style={{ gap: 10, backgroundColor: theme.colors.accent }}
            variant='solid'
            onPress={async () => handleAction('conversation')}
          >
            <IconButton
              icon={faComments}
              iconStyle={{
                color: theme.colors.textInverse,
              }}
            />
            <Text
              style={{
                color: theme.colors.textInverse,
                fontSize: theme.fontSize('md'),
              }}
            >
              {i18n.t('conversation')}
            </Text>
          </Button>
        </View>
      </Sheet.Frame>
    </Sheet>
  )
}

const ContactDetails = ({ route, navigation }: Props) => {
  const colorScheme = useColorScheme()
  const theme = useTheme()
  const { params } = route
  const insets = useSafeAreaInsets()
  const { contacts, deleteContact } = useContacts()
  const contact = useMemo(
    () => contacts.find((c) => c.id === params.id),
    [contacts, params.id]
  )
  const { conversations } = useConversations()

  const highlightedConversation = useMemo(
    () => conversations.find((c) => c.id === params.highlightedConversationId),
    [conversations, params.highlightedConversationId]
  )

  const contactConversations = useMemo(
    () => conversations.filter(({ contact: { id } }) => id === contact?.id),
    [contact?.id, conversations]
  )

  const contactConversationsSorted = useMemo(
    () =>
      contactConversations.sort((a, b) =>
        moment(a.date).unix() < moment(b.date).unix() ? 1 : -1
      ),
    [contactConversations]
  )

  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    navigation.setOptions({
      header: ({ navigation }) => (
        <Header
          inverseTextAndIconColor
          noBottomBorder
          title=''
          buttonType='back'
          rightElement={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
                position: 'absolute',
                right: 0,
              }}
            >
              <Button
                onPress={async () => {
                  navigation.replace('Contact Form', {
                    id: params.id,
                    edit: true,
                  })
                }}
                style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}
              >
                <IconButton
                  icon={faPencil}
                  iconStyle={{ color: theme.colors.textInverse }}
                />
              </Button>
              <IconButton
                onPress={() => {
                  setSheetOpen(true)
                }}
                iconStyle={{ color: theme.colors.textInverse }}
                icon={faPlus}
              />
            </View>
          }
          backgroundColor={theme.colors.accent3}
        />
      ),
    })
  }, [
    contact?.id,
    navigation,
    params.id,
    theme.colors.accent3,
    theme.colors.textInverse,
  ])

  const isActiveBibleStudy = useMemo(
    () =>
      contact
        ? contactStudiedForGivenMonth({
            contact,
            conversations,
            month: new Date(),
          })
        : false,
    [contact, conversations]
  )

  const hasStudiedPreviously = useMemo(
    () =>
      contact
        ? contactHasAtLeastOneStudy({
            conversations,
            contact,
          })
        : false,
    [contact, conversations]
  )

  const mostRecentStudy = useMemo(
    () => (contact ? contactMostRecentStudy({ conversations, contact }) : null),
    [contact, conversations]
  )

  if (!contact) {
    return (
      <Wrapper style={{ flexGrow: 1, padding: 10 }}>
        <Text style={{ fontSize: 18, marginTop: 15 }}>
          {i18n.t('contactNotFoundForProvidedId')} {params.id}
        </Text>
      </Wrapper>
    )
  }

  const { name, address, phone, email } = contact

  const hasAddress = address && Object.values(address).some((v) => v.length > 0)

  return (
    <View>
      <ScrollView
        style={{
          position: 'relative',
          paddingTop: 100,
          marginTop: -100,
          backgroundColor: theme.colors.background,
        }}
      >
        <StatusBar style={colorScheme === 'light' ? 'light' : 'dark'} />

        <Wrapper
          noInsets
          style={{
            marginBottom: insets.bottom + 125,
            flexGrow: 1,
            flex: 1,
          }}
        >
          <Hero
            isBibleStudy={isActiveBibleStudy}
            hasStudiedPreviously={hasStudiedPreviously}
            mostRecentStudy={mostRecentStudy}
            name={name}
          />
          <View style={{ gap: 30 }}>
            <CardWithTitle
              titlePosition='inside'
              title='Details'
              style={{ margin: 20 }}
            >
              <View style={{ gap: 15 }}>
                {hasAddress && <AddressRow contact={contact} />}
                {phone && <PhoneRow contact={contact} />}
                {!hasAddress && !phone && !email && (
                  <Text>{i18n.t('noPersonalInformationSaved')}</Text>
                )}
                {email && <EmailRow contact={contact} />}
              </View>
            </CardWithTitle>
            <View style={{ gap: 10 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: theme.fonts.semiBold,
                  marginLeft: 10,
                  color: theme.colors.text,
                }}
              >
                {i18n.t('conversationHistory')}
              </Text>
              <View style={{ minHeight: 2 }}>
                <FlashList
                  renderItem={({ item }) => (
                    <ConversationRow
                      conversation={item}
                      highlighted={item.id === highlightedConversation?.id}
                    />
                  )}
                  ItemSeparatorComponent={() => <Divider borderWidth={2} />}
                  data={contactConversationsSorted}
                  ListEmptyComponent={
                    <View
                      style={{
                        backgroundColor: theme.colors.backgroundLighter,
                        paddingVertical: 10,
                      }}
                    >
                      <Button onPress={() => setSheetOpen(true)}>
                        <Text
                          style={{
                            margin: 20,
                            textDecorationLine: 'underline',
                          }}
                        >
                          {i18n.t('tapToAddAConversation')}
                        </Text>
                      </Button>
                    </View>
                  }
                  estimatedItemSize={70}
                />
              </View>
            </View>
            <DeleteContactButton
              contact={contact}
              contactId={params.id}
              deleteContact={deleteContact}
              navigation={navigation}
            />
          </View>
          <View
            style={{
              position: 'absolute',
              height: 360,
              width: '100%',
              zIndex: -100,
              backgroundColor: theme.colors.accent3,
            }}
          />
          {Platform.OS === 'ios' && (
            <View
              style={{
                backgroundColor: theme.colors.accent3,
                height: 1000,
                position: 'absolute',
                top: -1000,
                left: 0,
                right: 0,
              }}
            />
          )}
        </Wrapper>
      </ScrollView>
      <AddSheet
        contact={contact}
        navigation={navigation}
        setSheetOpen={setSheetOpen}
        sheetOpen={sheetOpen}
      />
    </View>
  )
}

export default ContactDetails
