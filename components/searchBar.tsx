import { Autocomplete, AutocompleteProps, Input, Paper, TextInput, TextInputProps, useMantineTheme } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import React from 'react';

const SearchBar = (props: AutocompleteProps) => {
  return (
    <Autocomplete
      icon={<IconSearch size="1.1rem" stroke={1.5} />}
      radius="xl"
      size="md"
      placeholder="Search"
      rightSectionWidth={42}
      dropdownPosition="bottom"
      {...props}    />
  );
}

export {SearchBar};