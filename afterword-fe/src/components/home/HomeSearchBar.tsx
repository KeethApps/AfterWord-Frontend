import React from "react";
import { Pressable } from "react-native";
import { SearchBar } from "../../components/shared/SearchBar";

export interface HomeSearchBarProps {
  onPress: () => void;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({ onPress }) => (
  <Pressable onPress={onPress} className="mb-8">
    <SearchBar
      placeholder="Search books, highlights, notes..."
      value={""}
      onChangeText={() => {}}
      editable={false}
      pointerEvents="none"
    />
  </Pressable>
);
