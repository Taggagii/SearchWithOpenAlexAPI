import { Card, Center, Button, TextInput, Collapse, Badge, ActionIcon, Paper, Checkbox, Grid, Text, Autocomplete } from "@mantine/core"
import { SelectAuthor } from "./selectAuthor"
import { IconPlus, IconX } from '@tabler/icons-react'
import { useEffect, useState } from "react";
import { DatePicker } from '@mantine/dates';

const AdvancedSearch = (props : any) => {
    const [advanced, setAdvanced] : [boolean, any] = useState(false);
    const [authorInfo, setAuthorInfo] : any = useState(null);
    const [suggestedSearchAuthors, setSuggestedSearchAuthors] : any = useState([]);
    const [suggestedSearchConcepts, setSuggestedSearchConcepts] : any = useState([]);
    const [lastSearchInputAuthors, setLastSearchInputAuthors] : any = useState(null);
    const [lastSearchInputConcepts, setLastSearchInputConcepts] : any = useState(null);

    const handleAuthorRemoval = (author : any) => {        
        props.setAuthors((oldAuthors : any) => {
            const newAuthors = [...oldAuthors];
            newAuthors.splice(newAuthors.findIndex((e : any) => e.id === author.id), 1);
            return newAuthors;
        })
    }

    const handleConceptRemoval = (concept : any) => {        
        props.setConcepts((oldConcepts : any) => {
            const newConcepts = [...oldConcepts];
            newConcepts.splice(newConcepts.findIndex((e : any) => e.id === concept.id), 1);
            return newConcepts;
        })
    }

    const addAuthor = () => {
        const authorInput : any = document.querySelector('#AuthorInput')
        const newAuthor = authorInput.value;

        const getAuthorInfo = async (searchValue : string) => {
            if (searchValue !== '') {
                const searchString = `https://api.openalex.org/authors?search=${searchValue}`;
                const response : Response = await fetch(searchString);
                if (response.status !== 200) {
                    console.error(`Error on fetch ${searchString}`);
                } else {
                    const content : {meta: any, results: any, group_by: any} = await response.json();
                    setAuthorInfo(content);
                    authorInput.value = '';
                }
            }
        }

        getAuthorInfo(newAuthor);

    }

    const handleCheckBox = (event : any) => {
        props.setUseDateRange(event.target.checked);
    }

    const dateRangeIsValid = () => {
        return !props.useDateRange || (props.dateRange[0] && props.dateRange[1]);
    }

    const formatDate = (date : Date) => {
        return date.toISOString().substring(0, 10);
    }

    const advancedFiltersSet = () => {
        return props.authors.length || props.concepts.length || (props.dateRange[0] && props.dateRange[1] && props.useDateRange);
    }

    const toggleAdvancedFilters = () => {
        setAdvanced((e: boolean) => !e);

        props.setAuthors([]);
        props.setDateRange([null, null]);
        props.setUseDateRange(false);
        props.setConcepts([]);
        const useDateRangeCheckbox : any = document.querySelector('#useDateRangeCheckbox')
        const authorInput : any = document.querySelector('#AuthorInput')
        if (useDateRangeCheckbox && authorInput) {
            useDateRangeCheckbox.checked = false;
            authorInput.value = '';
        }
    }

    useEffect(() => {
        const delay = setTimeout(async () => {
            const searchBar : any = document.querySelector('#AuthorInput');
            if (searchBar) {
                const searchQuery = searchBar.value;
                const request = await fetch(`https://api.openalex.org/autocomplete/authors?q=${searchQuery}`);
                if (request.status === 200) {
                    const autocompleteContent = await request.json();
    
                    setSuggestedSearchAuthors((oldValue: any) => {
                        return autocompleteContent.results.map((value: any) => value.display_name);
                    });
                } else {
                    setSuggestedSearchAuthors([]);
                }
            }
        }, 250)
        return () => clearTimeout(delay);
    }, [lastSearchInputAuthors])

    useEffect(() => {
        const delay = setTimeout(async () => {
            const searchBar : any = document.querySelector('#ConceptInput');
            if (searchBar) {
                const searchQuery = searchBar.value;
                const request = await fetch(`https://api.openalex.org/autocomplete/concepts?q=${searchQuery}`);
                if (request.status === 200) {
                    const autocompleteContent = await request.json();
                    
                    setSuggestedSearchConcepts((oldValue: any) => {
                        return autocompleteContent.results.map((value: any) => value.display_name);
                    });
                } else {
                    setSuggestedSearchConcepts([]);
                }
            }
        }, 250)
        return () => clearTimeout(delay);
    }, [lastSearchInputConcepts])

    const addConcept = () => {
        const conceptInput : any = document.querySelector('#ConceptInput');
        const concept = conceptInput.value;
        const getConceptInfo = async (searchValue : string) => {
            if (searchValue !== '') {
                const searchString = `https://api.openalex.org/concepts?search=${searchValue}`;
                const response : Response = await fetch(searchString);
                if (response.status !== 200) {
                    console.error(`Error on fetch ${searchString}`);
                } else {
                    const content : {meta: any, results: any, group_by: any} = await response.json();
                    props.setConcepts((oldConcepts: any) => {
                        const newConcepts = [...oldConcepts];
                        if (newConcepts.findIndex((e) => e.id === content.results[0].id) === -1) {
                            newConcepts.push({
                                "id": content.results[0].id,
                                "name": content.results[0].display_name,
                            })
                        }
                        return newConcepts;
                    })

                }
            }
        }

        getConceptInfo(concept);
    }

    const handleKeyDownSearchAuthors = (event : any) => {
        if (event.code === "Enter") {
            addAuthor();
        } else {
            setLastSearchInputAuthors(Date.now())
        }
    }

    const handleKeyDownSearchConcepts= (event : any) => {
        if (event.code === "Enter") {
            addConcept();
        } else {
            setLastSearchInputConcepts(Date.now())
        }
    }

    return (
        <Paper withBorder={advanced} style={{margin: "10px"}}>
                <Center>
                    <Button
                        size="xs"
                        color={advancedFiltersSet() ? "red" : "blue"}
                        onClick={toggleAdvancedFilters}
                        
                        rightIcon={advanced ? 
                            <IconX color="white" size={"1rem"} />
                            :
                            <IconPlus color="white" size={"1rem"} />
                        }
                    >
                        {advancedFiltersSet() && "Clear "}Advanced Search
                    </Button>
                </Center>
            
                <Collapse in={advanced} style={{padding: "30px"}}>
                    {/* Advanced Author Selector */}
                    <Autocomplete
                        placeholder="Author Name"
                        label="Authors"
                        id="AuthorInput"
                        onKeyUp={handleKeyDownSearchAuthors}
                        dropdownPosition="bottom"
                        rightSection={(
                            <Button onClick={addAuthor}>Add</Button>
                        )}
                        data={suggestedSearchAuthors}
                    />
                    {/* Display selected authors */}
                    <Card>
                        {props.authors.map((author : any) => (
                            <Badge key={author.id} rightSection={(
                                <ActionIcon
                                onClick={() => {handleAuthorRemoval(author)}}
                                size="xs"
                                color="red"
                                >
                                    <IconX size={"10rem"} />
                                </ActionIcon>
                            )}>{author.name}</Badge>
                        ))}
                    </Card>
                    <Paper>
                        <SelectAuthor setAuthorInfo={setAuthorInfo} authorInfo={authorInfo} setAuthors={props.setAuthors}></SelectAuthor>
                    </Paper>

                    {/* Advanced concept selector */}
                    <Autocomplete
                        placeholder="Concept Name"
                        label="Concepts"
                        id="ConceptInput"
                        onKeyUp={handleKeyDownSearchConcepts}
                        dropdownPosition="bottom"
                        // rightSection={(
                        //     <Button onClick={addAuthor}>Add</Button>
                        // )}
                        data={suggestedSearchConcepts}
                    />
                    {/* Display selected concepts */}
                    <Card>
                        {props.concepts.map((concept : any) => (
                            <Badge key={concept.id} rightSection={(
                                <ActionIcon
                                onClick={() => {handleConceptRemoval(concept)}}
                                size="xs"
                                color="red"
                                >
                                    <IconX size={"10rem"} />
                                </ActionIcon>
                            )}>{concept.name}</Badge>
                        ))}
                    </Card>


                    <br />

                    {/* Advanced published date selector */}
                    <Paper>
                            <Checkbox
                                label="Use Date Range"
                                onChange={handleCheckBox}
                                id="useDateRangeCheckbox"
                                ></Checkbox>
                            {props.useDateRange && (
                                <>
                                    <Center>
                                        {dateRangeIsValid() ? 
                                            (<Text color="green">{formatDate(props.dateRange[0])} - {formatDate(props.dateRange[1])}</Text>)
                                            :
                                            (<Text color="red">Date range is invalid</Text>)   
                                        }
                                    </Center>
                                    <Center>
                                        <DatePicker
                                            defaultLevel="decade"
                                            numberOfColumns={2}
                                            type="range"
                                            value={props.dateRange}
                                            onChange={props.setDateRange}
                                            minDate={new Date(1500, 1, 1)}
                                            maxDate={new Date(Date.now())}
                                            />
                                    </Center>
                                </>
                            )}
                        </Paper>
                        

                </Collapse>

        </Paper>
    )
}

export default AdvancedSearch