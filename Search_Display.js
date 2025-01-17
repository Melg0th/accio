import { cards } from './cards.js';

let currentPage = 1;
const cardsPerPage = 20;

const setAbbreviations = {
    "HAH": "Hogwarts a History",
    "GOF": "Goblet of Fire",
    "QC": "Quidditch Cup",
    "B": "Base",
    "DA": "Diagon Alley",
    "AAH": "Adventures at Hogwarts",
    "COS": "Chamber of Secrets",
    "HOS": "Heir of Slytherin",
    "POA": "Prisoner of Azkaban",
    "SOH": "Streets of HogsMeade",
    "EOTP": "Echoes of the Past",
    "PRO": "Promotional"
};


document.addEventListener('DOMContentLoaded', function() {
    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const searchString = urlParams.get('search') || '';

    // Log the search string to the console
    console.log('Search String:', searchString);

    // Parse the search string and filter cards
    const filteredCards = filterCardsBySearchString(cards, searchString);

    // Log the filtered cards to the console
    console.log('Filtered Cards:', filteredCards);

    // Display the filtered cards
    displayFilteredCards(filteredCards, currentPage);

    // Update the result count
    updateResultCount(filteredCards.length);

    // Add event listeners for filter and sort options
    document.getElementById('Search_Display_Body_Filters_SortBy_Dropdown').addEventListener('change', function() {
        applyFiltersAndSort();
    });

    document.getElementById('Search_Display_Body_Filters_Ascending_Dropdown').addEventListener('change', function() {
        applyFiltersAndSort();
    });
});

function conditionEval(cost, condition) {
    const regex = /([<>]=?|==?|!=)?(\d+)/;
    let match = condition.match(regex);
    if (!match) {
        return false;
    }

    let operator = match[1];
    let value = parseFloat(match[2]);
    cost = parseFloat(cost);

    switch (operator) {
        case "<":
            return cost < value;
        case "<=":
            return cost <= value;
        case ">":
            return cost > value;
        case ">=":
            return cost >= value;
        case "!=":
            return cost !== value;
        default:
            // This covers no operator, '=' and '=='
            return cost === value;
    }
}

function filterCard(card, terms) {
    let term_pairs = terms.map((el, index) => [el, terms[index + 1] || ""]);
    for (const [term, next_term] of term_pairs) {
        if (term.includes(':')) {
            const [prefix, ...queryParts] = term.split(':');
            const query = queryParts.join(':').toLowerCase().trim();

            let queryIsORConditional = next_term === '|'; // Special case where an OR operand is in play

            switch (prefix.toLowerCase()) {
                case 'n':
                case 'name':
                case 'nm':
                    if (!card.name?.toLowerCase().includes(query)) {
                        return false;
                    };
                    break;
                case 'num':
                case 'number':
                    // Not sure _why_ would want to search number with operands, but now it can be done
                    if (!card.hasOwnProperty('number')) {
                        return false;
                    }
                    if (!conditionEval(card.number, query)) {
                        return false;
                    };
                    break;
                case 'fl':
                case 'flavor':
                case 'flavortext':
                    if (!card.flavorText?.toLowerCase().includes(query)) {
                        return false;
                    };
                    break;
                case 't':
                case 'type':
                    if (!card.type?.some(type => type.toLowerCase().includes(query))) {
                        return false;
                    };
                    break;
                case 'k':
                case 'keyword':
                    if (!card.subTypes?.some(subType => subType.toLowerCase().includes(query))) {
                        return false;
                    };
                    break;
                case 'r':
                case 'rarity':
                    if (!card.rarity?.toLowerCase().includes(query)) {
                        return false;
                    };
                    break;
                case 'a':
                case 'artist':
                    if (!card.hasOwnProperty('artist')) {
                        return false;
                    }
                    let _artist = Array.isArray(card.artist)
                        ? card.artist.join(', ') // Join array of artists into a string
                        : card.artist // Handle single string artist
                    if (!_artist.toLowerCase().includes(query)) {
                        return false;
                    }
                    break;
                case 'e':
                case 'effect':
                    if (!card.effect?.some(effect => effect.toLowerCase().includes(query))) {
                        return false;
                    };
                    break;
                case 's':
                case 'set':
                case 'setname':
                    let _setName = card.setName?.toLowerCase();
                    let _setAbbreviation = Object.keys(setAbbreviations).find(abbr => setAbbreviations[abbr].toLowerCase() === _setName);
                    if (!(_setName.includes(query) || _setAbbreviation.toLowerCase() === query)) {
                        return false;
                    }
                    break;
                case 'd':
                case 'date':
                case 'releasedate':
                    if (!card.releaseDate?.toLowerCase().includes(query)) {
                        return false;
                    };
                    break;
                case 'ts':
                case 'solve':
                case 'tosolve':
                    if (!card.toSolve?.toLowerCase().includes(query)) {
                        return false;
                    };
                    break;
                case 're':
                case 'reward':
                    if (!card.reward?.toLowerCase().includes(query)) {
                        return false;
                    };
                    break;
                case 'l':
                case 'lesson':
                    if (!card.lesson?.some(lesson => lesson.toLowerCase().includes(query))) {
                        return false;
                    };
                    break;
                case 'c':
                case 'cost':
                case 'power':
                case 'pow':
                    if (!card.hasOwnProperty('cost')) {
                        return false;
                    }
                    if (!conditionEval(card.cost, query)) {
                        return false;
                    };
                    break;
                case 'dmg':
                case 'damage':
                case 'dmgeachturn':
                    if (!card.hasOwnProperty('dmgEachTurn')) {
                        return false;
                    };
                    if (!conditionEval(card.dmgEachTurn, query)) {
                        return false;
                    };
                    break;
                case 'h':
                case 'health':
                    if (!card.hasOwnProperty('health')) {
                        return false;
                    };
                    if (!conditionEval(card.health, query)) {
                        return false;
                    };
                    break;
                case 'note':
                    if (!card.note?.toLowerCase().includes(query)) {
                        return false;
                    };
                    break;
                case 'pl':
                case 'provideslesson':
                case 'provides.lesson':
                    if (!card.provides?.some(item => {return item.lesson?.toLowerCase().includes(query)})) {
                        return false;
                    };
                    break;
                case 'pa':
                case 'providesamount':
                case 'provides.amount':
                    if (!card.provides?.some(item => {return conditionEval(item.amount?.toString(), query)})) {
                        return false;
                    };
                    break;
                case 'tw':
                case 'towin':
                    if (!card.toWin?.toLowerCase().includes(query)) {
                        return false;
                    };
                    break;
                case 'p':
                case 'prize':
                    if (!card.prize?.toLowerCase().includes(query)) {
                        return false;
                    };
                    break;
            }
        } else if (term === '*') {
            // Do nothing; * is defined as an 'and' operand condition, but each separate term is already and conditional...
        } else if (term === '|') {
            // Or condition the next term only
        } else {
            // Default to name search (should this search _all_ fields though?)
            if (!card.name.toLowerCase().includes(term.toLowerCase())){
                return false;
            }
        }
    }

    return true;
}

function filterCardsBySearchString(cards, searchString) {
    // Split the search string into terms, handling quotes
    const terms = searchString.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g).map(term => term.replace(/"/g, '')).filter(term => term.trim() !== '');
    console.log(terms)

    return cards.filter(card => filterCard(card, terms));
}

function displayFilteredCards(cards, page) {
    const resultsContainer = document.getElementById('results_container');
    const paginationControls = document.getElementById('pagination_controls');
    resultsContainer.innerHTML = ''; // Clear any existing content
    paginationControls.innerHTML = ''; // Clear any existing pagination controls

    if (cards.length === 0) {
        resultsContainer.innerHTML = '<p>No cards found.</p>';
    } else {
        const startIndex = (page - 1) * cardsPerPage;
        const endIndex = startIndex + cardsPerPage;
        const paginatedCards = cards.slice(startIndex, endIndex);

        paginatedCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';

            if (card.horizontal) {
                cardElement.classList.add('horizontal-card');
            }

            const imgElement = document.createElement('img');
            imgElement.src = 'cardimages/' + card.imgSrc;
            imgElement.alt = card.name;
            cardElement.appendChild(imgElement);

            cardElement.addEventListener('click', function() {
                const url = `Card_Display.html?card=${encodeURIComponent(card.name)}`;
                window.location.href = url;
            });

            resultsContainer.appendChild(cardElement);
        });

        const totalPages = Math.ceil(cards.length / cardsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = i === page ? 'active' : '';
            pageButton.addEventListener('click', function() {
                currentPage = i;
                displayFilteredCards(cards, currentPage);
            });
            paginationControls.appendChild(pageButton);
        }
    }
}

function updateResultCount(count) {
    document.getElementById('result_count').textContent = count;
}

function applyFiltersAndSort() {
    const sortBy = document.getElementById('Search_Display_Body_Filters_SortBy_Dropdown').value;
    const sortOrder = document.getElementById('Search_Display_Body_Filters_Ascending_Dropdown').value;

    let filteredCards = filterCardsBySearchString(cards, localStorage.getItem('SearchString') || '');

    if (sortBy) {
        filteredCards.sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'Set': // Set/Number
                    valueA = a.setName + a.number;
                    valueB = b.setName + b.number;
                    break;
                case 'Name': // Name
                    valueA = a.name;
                    valueB = b.name;
                    break;
                case 'Cost': // Cost
                    valueA = a.cost;
                    valueB = b.cost;
                    break;
                case 'Type':
                    valueA = a.type.join(', ');
                    valueB = b.type.join(', ');
                    break;
                case 'Rarity':
                    valueA = a.rarity;
                    valueB = b.rarity;
                    break;
                case 'Artist':
                    valueA = a.artist;
                    valueB = b.artist;
                    break;
                case 'Lesson':
                    valueA = a.lesson.join(', ');
                    valueB = b.lesson.join(', ');
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) {
                return -1;
            }
            if (valueA > valueB) {
                return 1;
            }
            return 0;
        });

        if (sortOrder === 'Desc') {
            filteredCards.reverse();
        }
    }

    // Display the filtered and sorted cards
    displayFilteredCards(filteredCards, currentPage);

    // Update the result count
    updateResultCount(filteredCards.length);
}

// Include the ability to search from this page
const searchInput = document.getElementById('search_input');
searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const StringValue = searchInput.value;

        localStorage.setItem('SearchString', StringValue);

        const url = `Search_Display.html?search=${encodeURIComponent(StringValue)}`;

        // Redirect to the new URL
        window.location.href = url;
    }
});
