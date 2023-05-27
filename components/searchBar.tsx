import { Input, TextInput, TextInputProps, useMantineTheme } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import React from 'react';

const SearchBar = (props: TextInputProps) => {
  return (
    <Input
      icon={<IconSearch size="1.1rem" stroke={1.5} />}
      radius="xl"
      size="md"
      placeholder="Search"
      rightSectionWidth={42}
      {...props}
    />
  );
}

export {SearchBar};