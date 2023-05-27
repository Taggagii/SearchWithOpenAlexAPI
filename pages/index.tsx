import { ActionIcon, useMantineTheme, Container, Accordion, Badge, Card, Grid, Text, Center, Group, Pagination, Collapse, Button, Paper, TextInput } from '@mantine/core';
import { IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { SearchBar } from '../components/searchBar';
import Link from 'next/link';
import { SelectAuthor } from '../components/selectAuthor';
import { IconX } from '@tabler/icons-react'

export default function Home() {
    const theme = useMantineTheme();

    const [doSearch, setDoSearch] : [boolean, Dispatch<SetStateAction<boolean>>] = useState(false);
    const [content, setContent] : [any, Dispatch<SetStateAction<any>>] = useState(null);
    const [accordionOpened, setAccordionOpened] : [number, Dispatch<SetStateAction<number>>] = useState(-1);
    const [noResults, setNoResults] : [boolean, Dispatch<SetStateAction<boolean>>] = useState(true);
    const [loading, setLoading] : [boolean, Dispatch<SetStateAction<boolean>>] = useState(false);
    const [activePage, setActivePage] : [number, Dispatch<SetStateAction<number>>] = useState(1)
    const [advanced, setAdvaned] : [boolean, Dispatch<SetStateAction<boolean>>] = useState(false);
    const [authorInfo, setAuthorInfo] : any = useState(null);
    const [authors, setAuthors] : any = useState([]);

    useEffect(() => {
        const getContent = async (searchValue : string) => {
            // const searchString = `https://api.openalex.org/works?search=${searchValue}&page=${activePage}&filter=authorships.author.id:A4330441364,authorships.author.id:A3056060526`;
            // const searchString = `https://api.openalex.org/authors?search=carl%20sagan`;
            if (authors.length || searchValue !== "") {
                const authorIds = authors.map((author : any) => author.id.match(/.*\/(.*)/)[1])
                // any authors
                const authorSearchFilter = `authorships.author.id:${authorIds.join(':')}`;
                // exact authors
                // const authorSearchFilter = authorIds.map((authorId : string) => `authorships.author.id:${authorId}`).join(',')


                let searchString = `https://api.openalex.org/works?search=${searchValue}&page=${activePage}`;

                if (authorIds.length > 0) {
                    searchString += '&filter=' + authorSearchFilter;
                }

                const response : Response = await fetch(searchString);
                if (response.status !== 200) {
                    console.error(`Error on fetch ${searchString}`);
                } else {
                    const content : {meta: any, results: any, group_by: any} = await response.json();
                    console.log(content)
                    setNoResults(Object.keys(content.results).length == 0)
                    setContent(content)
                }
            }
        }

        const searchBar : any = document.querySelector("#SearchBar")
        const searchValue : string = searchBar.value ?? "";

        if (!loading && doSearch) {
            setLoading(true);
            // setContent(null); // todo : make it hide search in a different way
            getContent(searchValue);
            setLoading(false)
        }
        setDoSearch(false)
    }, [doSearch])

    useEffect(() => {
        setDoSearch(true);
    }, [activePage])

    const addAuthor = (event : any) => {
        const authorInput : any = document.querySelector('#AuthorInput')
        const newAuthor = authorInput.value;

        const getAuthorInfo = async (searchValue : string) => {
            if (searchValue !== '') {
                const searchString = `https://api.openalex.org/authors?search=${searchValue}`;
                const response : Response = await fetch(searchString);
                console.log(response)
                if (response.status !== 200) {
                    console.error(`Error on fetch ${searchString}`);
                } else {
                    const content : {meta: any, results: any, group_by: any} = await response.json();
                    console.log(content)
                    setAuthorInfo(content);
                }
            }
        }

        getAuthorInfo(newAuthor);


        // console.log(`Adding author '${newAuthor}'`);
        // setAuthors((oldAuthors) => [...oldAuthors, newAuthor]);

        authorInput.value = '';
    }



    const searchButton : any = (
        <ActionIcon onClick={() => {setDoSearch(true)}} size={32} radius="xl" color={theme.primaryColor} variant="filled">
          {theme.dir === 'ltr' ? (
            <IconArrowRight size="1.1rem" stroke={1.5} />
          ) : (
            <IconArrowLeft size="1.1rem" stroke={1.5} />
          )}
        </ActionIcon>
    )

    const handleKeyDownSearch = (event : any) => {
        if (event.code === "Enter") {
            setDoSearch(true)
        }
    }

    const handleAccordionClick = (index : number) => {
        setAccordionOpened((oldValue : any) => {
            return (oldValue === index) ? -1 : index;
        });
    }

    useEffect(() => {
        console.log(JSON.stringify(authors));
    }, [authors])

    const handleAuthorRemoval = (author : any) => {        
        setAuthors((oldAuthors : any) => {
            const newAuthors = [...oldAuthors];
            newAuthors.splice(newAuthors.findIndex((e : any) => e.id === author.id), 1);
            return newAuthors;
        })
    }

    return (
        <Container>

            <Card style={{paddingTop: (noResults) ? "30%" : "10px"}}>
                <SearchBar rightSection={searchButton} id="SearchBar" onKeyUp={handleKeyDownSearch}></SearchBar>
                <Card>
                    <Center>
                        <Button onClick={() => {setAdvaned((e) => !e)}}>Advanced Search</Button>
                    </Center>
                        <Collapse in={advanced}>
                        <TextInput
                            placeholder="Author Name"
                            label="Authors"
                            id="AuthorInput"
                            rightSection={(
                                <Button onClick={addAuthor}>Add</Button>
                            )}
                            />
                        <Card>
                            {authors.map((author : any) => (
                                <Badge rightSection={(
                                    <ActionIcon onClick={() => {handleAuthorRemoval(author)}} size="xs" color="red" radius="xl" variant="transparent">
                                        <IconX size={"10rem"} />
                                    </ActionIcon>
                                )}>{author.name}</Badge>
                            ))}
                        </Card>
                        <SelectAuthor setAuthorInfo={setAuthorInfo} authorInfo={authorInfo} setAuthors={setAuthors}></SelectAuthor>
                        </Collapse>
                </Card>
            </Card>

            {content !== null && Object.keys(content.results).length !== 0 && (<>
                <Container style={{padding: "10px"}}>
                    <Text fz="xs">
                        {content.meta.count.toLocaleString()} results ({content.meta.db_response_time_ms / 1000} sec)
                    </Text>
                </Container>
                <Accordion>
                    {/* Accordian of all the results */}
                    {content.results.map((result : any, index: number) => (
                        <Accordion.Item key={result?.id} value={result?.title ?? 'invalidValue'}>
                            <Accordion.Control onClick={() => {handleAccordionClick(index)}}>
                                <Link href={result?.id} target='_blank'><Text fw={500} td="underline">{result?.title}</Text></Link>
                                
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
                                        {
                                            accordionOpened === index ? 
                                            result.concepts.map((concept : any) => concept.display_name).join(', ')
                                            :
                                            result.concepts.map((concept : any) => concept.display_name).join(', ').substring(0, 125) + '...'
                                        }
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
        <Center>
            <Card>
                <Pagination value={activePage} onChange={setActivePage} total={content.meta.count / content.meta.per_page}></Pagination>
            </Card>
        </Center>
            </>)}
        </Container>
    );
}