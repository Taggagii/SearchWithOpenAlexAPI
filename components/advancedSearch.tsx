import { Card, Center, Button, TextInput, Collapse, Badge, ActionIcon, Paper, Checkbox, Grid, Text } from "@mantine/core"
import { SelectAuthor } from "./selectAuthor"
import { IconX } from '@tabler/icons-react'
import { useEffect, useState } from "react";
import { DatePicker } from '@mantine/dates';

const AdvancedSearch = (props : any) => {
    const [advanced, setAdvanced] : [boolean, any] = useState(false);
    const [authorInfo, setAuthorInfo] : any = useState(null);

    const handleAuthorRemoval = (author : any) => {        
        props.setAuthors((oldAuthors : any) => {
            const newAuthors = [...oldAuthors];
            newAuthors.splice(newAuthors.findIndex((e : any) => e.id === author.id), 1);
            return newAuthors;
        })
    }

    const addAuthor = (event : any) => {
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
                }
            }
        }

        getAuthorInfo(newAuthor);

        authorInput.value = '';
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
        return props.authors.length || (props.dateRange[0] && props.dateRange[1] && props.useDateRange);
    }

    const toggleAdvancedFilters = () => {
        setAdvanced((e: boolean) => !e);

        props.setAuthors([]);
        props.setDateRange([null, null]);
        props.setUseDateRange(false);
        const useDateRangeCheckbox : any = document.querySelector('#useDateRangeCheckbox')
        const authorInput : any = document.querySelector('#AuthorInput')
        if (useDateRangeCheckbox && authorInput) {
            useDateRangeCheckbox.checked = false;
            authorInput.value = '';
        }
    }

    return (
        <Card withBorder={advanced} style={{margin: "10px"}}>
                <Center>
                    <Button size="xs" color={advancedFiltersSet() ? "red" : "blue"} onClick={toggleAdvancedFilters}>{advancedFiltersSet() && "Clear "}Advanced Search</Button>
                </Center>
            
                <Collapse in={advanced} style={{padding: "30px"}}>
                    {/* Advanced Author Selector */}
                    <TextInput
                        placeholder="Author Name"
                        label="Authors"
                        id="AuthorInput"
                        rightSection={(
                            <Button onClick={addAuthor}>Add</Button>
                        )}
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

        </Card>
    )
}

export default AdvancedSearch