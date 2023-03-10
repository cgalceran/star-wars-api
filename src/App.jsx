import image from "./images/bg.jpeg";
import { StarWarsLogo } from "./components/StarWarsLogo";
import React, { useEffect, useRef, useState } from "react";
import Search from "./components/Search";
import TableList from "./components/TableList";
import Pagination from "./components/Pagination";
import { Spinner } from "./components/Spinner";
import axios from "axios";
import { v4 as uuid } from "uuid";

const SWAPI_PEOPLE_URL = "https://swapi.dev/api/people/";

function App() {
  const [characters, setCharacters] = useState([]);
  const [count, setCount] = useState();
  const [numberPages, setNumberPages] = useState([]);
  const [nextPage, setNextPage] = useState();
  const [previousPage, setPreviousPage] = useState();
  const [search, setSearch] = useState(false);
  const [searchingFor, setSearchingFor] = useState('');
  const [loading, setLoading] = useState(false);
  

  const initialLoading = useRef(0);

  useEffect(() => {
    if (initialLoading.current < 1) {
      getCharacter(SWAPI_PEOPLE_URL);
      initialLoading.current++;
    }
  }, []);

  // API call
  const getCharacter = async (url) => {
    setLoading(true);
    const response = await axios.get(url);
    const data = response.data;
    const people = response.data.results;
    people.map(async (char) => {
      const id = uuid();
      const homeworld = await axios
        .get(char.homeworld)
        .then((res) => res.data.name);
      const species =
        char.species.length == 0
          ? "Human"
          : await axios.get(char.species).then((res) => res.data.name);
      setCharacters((prev) => [
        ...prev,
        {
          id: id,
          name: char.name,
          birth_year: char.birth_year,
          height: char.height,
          mass: char.mass,
          homeworld: homeworld,
          species: species,
        },
      ]);
    });
    setCount(data.count);
    setNumberPages(Array(Math.ceil(data.count / 10)).fill("e"));
    setNextPage(data.next);
    setPreviousPage(data.previous);
    setLoading(false);
  };

  // Pagination

  const handleNextPage = () => {
    if (nextPage === null) return;
     setCharacters([]);
     getCharacter(nextPage);
  };

  const handlePreviousPage = () => {
    if (previousPage === null) return;
    setCharacters([]);
    getCharacter(previousPage);
  };

  const handlePagination = (value) => {
    setCharacters([]);
    getCharacter(SWAPI_PEOPLE_URL + '?search='+searchingFor+`&page=${value}`);

  }

  const handlePageNumber = (value) => {
    setCharacters([]);
    getCharacter(SWAPI_PEOPLE_URL + `?search=&page=${value}`);
  };

  // Search
  const handleSearch = (value) => {
    if (value === "") return;
    setCharacters([]);
    setSearch(true);
    setSearchingFor(value);
    getCharacter(SWAPI_PEOPLE_URL + `?search=${value}`);
  };
  // Reload page to initial state when click on Logo
  const handleRefresh = () => {
    setCharacters([]);
    getCharacter(SWAPI_PEOPLE_URL);
  };

  return (
    <>
      <section
        style={{
          backgroundImage: `url(${image})`,
        }}
        className="h-full w-full bg-cover bg-center sm:h-full"
      >
        <div className="flex items-center justify-center">
          <div onClick={handleRefresh} style={{ cursor: "pointer" }}>
            <StarWarsLogo
              height={175}
              fill={"#feda4a"}
              onrefresh={handleRefresh}
            />
          </div>
        </div>
        <div className="container mx-auto">
          <Search onSearch={handleSearch} />
          {loading ? (
            < Spinner/>
          ) : (
            <TableList characters={characters} />
          )}

          <Pagination
            countCharacters={characters.length}
            count={count}
            pages={numberPages}
            searchPage={search}
            next={handleNextPage}
            previous={handlePreviousPage}
            onPage={handlePageNumber}
            onPagination={handlePagination}
          />
        </div>
      </section>
    </>
  );
}

export default App;
