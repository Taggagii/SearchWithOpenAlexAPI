import { ActionIcon, useMantineTheme, Container, Accordion, Badge, Card, Grid, Text, Center, Group, Pagination} from '@mantine/core';
import { IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { SearchBar } from '../components/searchBar';
import Link from 'next/link';
import AdvancedSearch from '../components/advancedSearch';
import SearchResults from '../components/searchResults';

export default function Home() {
    const theme = useMantineTheme();

    const [doSearch, setDoSearch] : [boolean, Dispatch<SetStateAction<boolean>>] = useState(false);
    const [content, setContent] : [any, Dispatch<SetStateAction<any>>] = useState(null);
    const [searchFailed, setSearchFailed] : any = useState(false);
    const [loading, setLoading] : [boolean, Dispatch<SetStateAction<boolean>>] = useState(false);
    const [activePage, setActivePage] : [number, Dispatch<SetStateAction<number>>] = useState(1);

    const [useDateRange, setUseDateRange] : any = useState(false);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [authors, setAuthors] : any = useState([]);

    const formatDate = (date : Date | null) => {
        if (date) {
            return date.toISOString().substring(0, 10)
        } else {
            return "";
        }
    }

    useEffect(() => {
        const getContent = async (searchValue : string) => {
            // const searchString = `https://api.openalex.org/works?search=${searchValue}&page=${activePage}&filter=authorships.author.id:A4330441364,authorships.author.id:A3056060526`;
            // const searchString = `https://api.openalex.org/authors?search=carl%20sagan`;
            const dateRangeIsGood = (useDateRange && dateRange[0] && dateRange[1])
            if (authors.length || searchValue !== "" || dateRangeIsGood) {
                const authorIds = authors.map((author : any) => author.id.match(/.*\/(.*)/)[1])
                // any authors
                const authorSearchFilter = `authorships.author.id:${authorIds.join(':')}`;
                // exact authors
                // const authorSearchFilter = authorIds.map((authorId : string) => `authorships.author.id:${authorId}`).join(',')


                let searchString = `https://api.openalex.org/works?search=${searchValue}&page=${activePage}`;

                const filters = []

                if (authorIds.length > 0) {
                    filters.push(authorSearchFilter);
                }

                if (dateRangeIsGood) {
                    const from_date : string = formatDate(dateRange[0]);
                    const to_date : string = formatDate(dateRange[1]);
                    const dateRangeSearchFilter = `from_publication_date:${from_date},to_publication_date:${to_date}`;
                    filters.push(dateRangeSearchFilter);
                }

                if (filters.length > 0) {
                    searchString += `&filter=${filters.join(',')}`;
                }

                console.log(`Requesting '${searchString}'`);
                const response : Response = await fetch(searchString);
                if (response.status !== 200) {
                    console.error(`Error on fetch ${searchString}`);
                    setSearchFailed(true);
                } else {
                    const content : {meta: any, results: any, group_by: any} = await response.json();
                    console.log(content)
                    setSearchFailed(true);
                    if (!content || Object.keys(content.results).length === 0) {
                        setSearchFailed(true);
                    } else {
                        setContent(content)
                        setSearchFailed(false);
                    }
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
    }, [doSearch, activePage, authors, loading, dateRange, useDateRange])

    useEffect(() => {
        setDoSearch(true);
    }, [activePage])



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

    const shouldShowContent = () => {
        return (content !== null && Object.keys(content.results).length);
    }

    return (
        <Container>
            {/* Search interface */}
            <Card style={{paddingTop: (!content) ? "30%" : "20px", paddingBottom: "0px"}}>
                <SearchBar error={searchFailed} rightSection={searchButton} id="SearchBar" onKeyUp={handleKeyDownSearch}></SearchBar>
                {searchFailed && (<Text color="red">No search results</Text>)}
                <AdvancedSearch
                    authors={authors}
                    setAuthors={setAuthors}
                    useDateRange={useDateRange}
                    setUseDateRange={setUseDateRange}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                />
            </Card>

            {shouldShowContent() && (<>
                <Card shadow='sm' withBorder>
                    {/* Search result count / time */}
                    <Container style={{padding: "10px"}}>
                        <Text fz="xs">
                            {content.meta.count.toLocaleString()} results ({content.meta.db_response_time_ms / 1000} sec)
                        </Text>
                    </Container>

                    {/* Results */}

                    <SearchResults content={content}></SearchResults>

                </Card>

                {/* Page Selector */}
                <Center>
                    <Card>
                        <Pagination
                            value={activePage}
                            onChange={setActivePage}
                            total={content.meta.count / content.meta.per_page}
                        ></Pagination>
                    </Card>
                </Center>
            </>)}
        </Container>
    );
}