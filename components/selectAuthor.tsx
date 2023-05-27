import { Input, TextInput, TextInputProps, useMantineTheme, Text, Accordion, Grid, Group, Badge, Button, Flex, Center } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const SelectAuthor = (props: any) => {
   const [accordionOpened, setAccordionOpened] : any = useState(-1);

   const handleAccordionClick = (index : number) => {
        setAccordionOpened((oldValue : any) => {
            return (oldValue === index) ? -1 : index;
        });
    }

    const showAuthors = () => {
        return props?.authorInfo?.results;
    }

    return (
        <Accordion>
            {showAuthors() && (
                <Center>
                    <Button
                        onClick={() => {
                            props.setAuthorInfo(null);
                            setAccordionOpened(-1);
                        }}
                        color="red"
                        size="xs"
                    >
                        Close Author Selector
                    </Button>
                </Center>
            )}
            {showAuthors() && props.authorInfo?.results.map((result : any, index : number) => (
                <Accordion.Item key={result.id} value={result.id}>
                    <Accordion.Control onClick={() => {handleAccordionClick(index)}}>
                        <Link href={result.id} target='_blank'>
                            <Text fw={500} td="underline">{result.display_name}</Text>
                        </Link>
                        <Button onClick={() => {
                            setAccordionOpened(-1);
                            props.setAuthors((oldValue : any) => [...oldValue, {"id": result.id, "name": result.display_name}]);
                            props.setAuthorInfo(null);
                        }}>
                            Select
                        </Button>

                        {/* Subtitle information */}
                        <Grid>
                            <Grid.Col key={0} span={3}>
                                <Group>
                                    <div>
                                        <Text size="sm" color="dimmed" weight={400}>{result?.works_count} works</Text>
                                        <Text size="sm" color="dimmed" weight={400}>Cited by {result?.cited_by_count}</Text>
                                    </div>
                                </Group>
                            </Grid.Col>
                            <Grid.Col key={1} span={8}>
                                {
                                    accordionOpened === index ? result.x_concepts.map((concept : any) => (
                                        <Badge key={result.id + concept.display_name}>{concept.display_name}</Badge>
                                    ))
                                    :
                                    result.x_concepts.slice(0, 5).map((concept : any) => (
                                        <Badge key={result.id + concept.display_name}>{concept.display_name}</Badge>
                                    ))
                                }
                                {accordionOpened !== index && Object.keys(result.x_concepts).length > 5 && (<Badge>...</Badge>)}
                            </Grid.Col>
                        </Grid>
                    </Accordion.Control>
                </Accordion.Item>
            ))}
        </Accordion>
    );
}

export {SelectAuthor};