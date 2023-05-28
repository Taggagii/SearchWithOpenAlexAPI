import { ActionIcon, useMantineTheme, Container, Accordion, Badge, Card, Grid, Text, Center, Group, Pagination, Paper} from '@mantine/core';
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
    const [concepts, setConcepts] : any = useState([]);
    const [suggestedSearch, setSuggestedSearch] : any = useState([]);
    const [lastSearchInput, setLastSearchInput] : any = useState(null);


    const formatDate = (date : Date | null) => {
        if (date) {
            return date.toISOString().substring(0, 10)
        } else {
            return "";
        }
    }

    const compileFiltersString = () => {
        const filters = [];
        
        if (authors.length > 0) {
            const authorIds = authors.map((author : any) => author.id.match(/.*\/(.*)/)[1])
            const authorSearchFilter = `authorships.author.id:${authorIds.join(':')}`;
            filters.push(authorSearchFilter);
        }

        if (useDateRange && dateRange[0] && dateRange[1]) {
            const from_date : string = formatDate(dateRange[0]);
            const to_date : string = formatDate(dateRange[1]);
            const dateRangeSearchFilter = `from_publication_date:${from_date},to_publication_date:${to_date}`;
            filters.push(dateRangeSearchFilter);
        }

        if (concepts.length > 0) {
            const conceptIds = concepts.map((author : any) => author.id.match(/.*\/(.*)/)[1])
            const conceptSearchFilter = `concepts.id:${conceptIds.join(':')}`;
            filters.push(conceptSearchFilter);
        }

        if (filters.length > 0) {
            return `&filter=${filters.join(',')}`;
        }

        return '';
    }

    useEffect(() => {
        const getContent = async (searchValue : string) => {
            // const searchString = `https://api.openalex.org/works?search=${searchValue}&page=${activePage}&filter=authorships.author.id:A4330441364,authorships.author.id:A3056060526`;
            // const searchString = `https://api.openalex.org/authors?search=carl%20sagan`;
            const dateRangeIsGood = (useDateRange && dateRange[0] && dateRange[1])
            if (authors.length || concepts.length || searchValue !== "" || dateRangeIsGood) {
                // contains any author
                // const authorSearchFilter = `authorships.author.id:${authorIds.join(':')}`;
                // contains all authors
                // const authorSearchFilter = authorIds.map((authorId : string) => `authorships.author.id:${authorId}`).join(',')


                let searchString = `https://api.openalex.org/works?search=${searchValue}&page=${activePage}`;

                searchString += compileFiltersString();

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
                        setSuggestedSearch([]);
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

    useEffect(() => {
        const delay = setTimeout(async () => {
            const searchBar : any = document.querySelector('#SearchBar');
            if (searchBar) {
                const searchQuery = searchBar.value;
                const request = await fetch(`https://api.openalex.org/autocomplete/works?q=${searchQuery}` + compileFiltersString());
                if (request.status === 200) {
                    const autocompleteContent = await request.json();
    
                    setSuggestedSearch((oldValue: any) => {
                        return autocompleteContent.results.map((value: any) => value.display_name);
                    });
                } else {
                    setSuggestedSearch([]);
                }
            }
        }, 250)
        return () => clearTimeout(delay);
    }, [lastSearchInput])

    const handleKeyDownSearch = (event : any) => {
        if (event.code === "Enter") {
            setDoSearch(true)
        } else {
            setLastSearchInput(Date.now())
        }
    }

    const shouldShowContent = () => {
        return (content !== null && Object.keys(content.results).length);
    }

    return (
        <Container>
            {/* Search interface */}
            <Paper style={{paddingTop: (!content) ? "30%" : "20px", paddingBottom: "0px"}}>
                <SearchBar
                    error={searchFailed}
                    rightSection={searchButton}
                    id="SearchBar"
                    onKeyUp={handleKeyDownSearch}
                    data={suggestedSearch}
                ></SearchBar>
                {searchFailed && (<Text color="red">No search results</Text>)}
                <AdvancedSearch
                    authors={authors}
                    setAuthors={setAuthors}
                    concepts={concepts}
                    setConcepts={setConcepts}
                    useDateRange={useDateRange}
                    setUseDateRange={setUseDateRange}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                />
            </Paper>

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