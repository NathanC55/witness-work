import { ReactNode } from "react";
import { TextInput } from "react-native";
import theme from "../constants/theme";

interface Props {
  placeholder?: string;
  value: string;
  setValue:
    | React.Dispatch<React.SetStateAction<string | undefined>>
    | ((value: string) => unknown);
}

const SearchBar = ({ placeholder, value, setValue }: Props) => {
  return (
    <TextInput
      value={value}
      onChangeText={(val) => setValue(val)}
      style={{
        height: 65,
        borderRadius: theme.numbers.borderRadiusLg,
        backgroundColor: theme.colors.backgroundLighter,
        paddingHorizontal: 15,
        borderColor: theme.colors.border,
        borderWidth: 1,
        flexGrow: 1,
      }}
      placeholder={placeholder ?? "Search for contact..."}
      clearButtonMode="while-editing"
      returnKeyType="search"
    />
  );
};
export default SearchBar;