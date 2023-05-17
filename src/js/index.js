const searchField = document.querySelector('.search__field')
const searchHints = document.querySelector('.search__hints')
const cards = document.querySelector('.cards')
let repos

const showMessage = (type, error) => {
const errElem = document.createElement('li')
errElem.classList.add('search__err')

if (type === 'noteFound') {
    errElem.textContent = `По данному запросу ничего не найдено.`
} else {
    errElem.textContent = `Не удалось получить список репозиториев. ${error.message}`
}

searchHints.appendChild(errElem)
}

const createHints = (repos) => {
    let fragment = document.createDocumentFragment()
    repos.forEach(elem => {
        let hint = document.createElement('li')
        hint.classList.add('search__hint')
        hint.textContent = elem.name
        fragment.appendChild(hint)
    });
    searchHints.innerHTML = ''
    searchHints.appendChild(fragment)
}

const searchRepos = async () => {

    searchHints.innerHTML = ''

    const request = searchField.value.trim()

    if (!request || !request.trim()) return

    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${request.trim()}`)
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`)
        }
    
        repos = (await response.json()).items
        if (!repos.length) {
            showMessage('noteFound')
            return
        }

        createHints(repos.slice(0, 5))

    } catch (error) {
        showMessage('', error)
    }
}

const addCard = evt => {
    searchHints.innerHTML = ''
    searchField.value = ''
    let name = evt.target.textContent
    repos.forEach(elem => {
        if (elem.name === name) {
            const {owner: {login}, stargazers_count} = elem

            let card = document.createElement('li')
            card.classList.add('cards__elem')            

            let cardName = document.createElement('span')
            cardName.classList.add('cards__txt')
            cardName.textContent = 'Name : ' + name
            card.appendChild(cardName)

            let cardLogin = document.createElement('span')
            cardLogin.classList.add('cards__txt')
            cardLogin.textContent = 'Owner : ' + login
            card.appendChild(cardLogin)

            let cardStars = document.createElement('span')
            cardStars.classList.add('cards__txt')
            cardStars.textContent = 'Stars : ' + stargazers_count
            card.appendChild(cardStars)

            let cardClose = document.createElement('button')
            cardClose.classList.add('cards__close')
            card.appendChild(cardClose)

            cards.appendChild(card)
        }
    });
}

const deleteCard = evt => {
    if (evt.target.classList[0] === 'cards__close') {
        evt.target.parentNode.remove()
    }
}

const debounce = (fn, time) => {
    let timer
    return function(...data) {
        clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, data)
        }, time)
    }
};

searchField.addEventListener('input', debounce(searchRepos, 1000)) 
searchHints.addEventListener('click', addCard)
cards.addEventListener('click', deleteCard)