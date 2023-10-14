import { View, TouchableOpacity } from "react-native";
import MyText from "./MyText";
import theme from "../constants/theme";
import Card from "./Card";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigation } from "../stacks/RootStack";
import { Contact } from "../types/contact";

const ContactRow = ({ contact }: { contact: Contact }) => {
  const { name, isBibleStudy } = contact;
  const navigation = useNavigation<RootStackNavigation>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Contact Details", { id: "test" })}
    >
      <Card
        style={{
          backgroundColor: theme.colors.backgroundLighter,
          alignItems: "center",
        }}
        flexDirection="row"
      >
        <View style={{ flexGrow: 1, gap: 2 }}>
          <MyText style={{ fontSize: 18 }}>{name}</MyText>
          <MyText style={{ color: theme.colors.textAlt, fontSize: 10 }}>
            2 Weeks Ago
          </MyText>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {isBibleStudy && (
            <FontAwesome
              style={{ color: theme.colors.text, fontSize: 15 }}
              name="book"
            />
          )}
          <FontAwesome
            style={{ color: theme.colors.textAlt, fontSize: 15 }}
            name="chevron-right"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default ContactRow;