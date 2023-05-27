import { ActionIcon, useMantineTheme, Container, Accordion, Badge, Card, Grid, Text, Center, Group, Pagination} from '@mantine/core';
import { IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import Link from 'next/link';

const SearchResults = (props : any) => {
    const [accordionOpened, setAccordionOpened] : [number, any] = useState(-1);

    const handleAccordionClick = (index : number) => {
        setAccordionOpened((oldValue : any) => {
            return (oldValue === index) ? -1 : index;
        });
    }

    return (
        <Accordion>
            {/* Accordian of all the results */}
            {props.content.results.map((result : any, index: number) => (
                <Accordion.Item key={result?.id} value={result?.id ?? 'invalidValue'}>
                    <Accordion.Control onClick={() => {handleAccordionClick(index)}}>
                        {/* Title */}
                        <Link href={result?.id} target='_blank'>
                            <Text fw={500} td="underline">{result?.title}</Text>
                        </Link>
                        
                        {/* Subtitle information */}
                        <Grid>
                            <Grid.Col key={0} span={3}>
                                <Group>
                                    <div>
                                        <Text size="sm" color="dimmed" weight={400}>Published {result?.publication_date}</Text>
                                        {/* <Text size="sm" color="dimmed" weight={400}>Created {result.created_date}</Text> */}
                                        <Text size="sm" color="dimmed" weight={400}>Cited by {result?.cited_by_count}</Text>
                                    </div>
                                </Group>
                            </Grid.Col>
                            <Grid.Col key={1}>
                                <Text>
                                {
                                    accordionOpened === index ? 
                                    result.concepts.map((concept : any) => concept.display_name).join(', ')
                                    :
                                    result.concepts.map((concept : any) => concept.display_name).join(', ').substring(0, 125) + '...'
                                }
                                </Text>
                            </Grid.Col>
                        </Grid>
                    </Accordion.Control>
                    <Accordion.Panel>
                        {/* Authors */}
                        <Card>
                            <Grid>
                            {
                                result.authorships.map((authorInfo: any) => (
                                    <Grid.Col span={4} key={authorInfo.author.id}>
                                        <Badge>author</Badge>
                                        {' '}
                                        <Link target='_blank' href={authorInfo.author.id} style={{ textDecoration: 'none' }}>
                                            {authorInfo.author.display_name}
                                        </Link>

                                    </Grid.Col>
                                ))
                            }
                            </Grid>
                        </Card>


                        {/* Link to article */}
                        <Card>
                            <Link href={result.id} target='_blank'>View article</Link>
                        </Card>
                    </Accordion.Panel>
                </Accordion.Item>
            ))}
        </Accordion>
    );
}

export default SearchResults;