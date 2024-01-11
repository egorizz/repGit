function debounce(fn, timeout) {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(fn(...args)), timeout);
    });
  };
}

document.addEventListener('DOMContentLoaded', function () {
  const inputSearch = document.querySelector("input");
  const loader = document.querySelector(".loader");
  const inputList = document.querySelector(".dropdown__list");
  const selected = document.querySelector(".dropdown__selected");

  function clearList() {
    inputList.innerHTML = "";
  }

  function clearSearch() {
    inputSearch.value = "";
  }

  function showLoader() {
    loader.classList.remove('hide')
  }

  function hideLoader() {
    loader.classList.add('hide')
  }

  function showRepos(repositories) {
    clearList();

    for (let repositoriesIndex = 0; repositoriesIndex < 5; repositoriesIndex++) {
      let name = repositories.items[repositoriesIndex].name;
      let owner = repositories.items[repositoriesIndex].owner.login;
      let stars = repositories.items[repositoriesIndex].stargazers_count;

      inputList.innerHTML += `<div class="dropdown-content" data-owner="${owner}" data-stars="${stars}">${name}</div>`;
    }
  }

  function addRepo(target) {
    let name = target.textContent;
    let owner = target.dataset.owner;
    let stars = target.dataset.stars;

    selected.innerHTML += `
    <div class="chosen">
      <div class="chosen__text">
        Name: ${name}<br>Owner: ${owner}<br>Stars: ${stars}
      </div>
      <button class="btn-close"></button>
    </div>`;
  }

  async function getReposAutocomplete() {
    showLoader();

    const url = new URL("https://api.github.com/search/repositories");
    let search = inputSearch.value;

    if (search == "") {
      clearList();
      hideLoader();
      return;
    }

    url.searchParams.append("q", search);

    try {
      let response = await fetch(url);
      if (response.ok) {
        let repo = await response.json();
        showRepos(repo);
      } else {
        return null
      };
    } catch (error) {
      console.log(error);
    }

    hideLoader();
  }

  selected.addEventListener("click", function (event) {
    let target = event.target;
    if (!target.classList.contains("btn-close")) {
      return;
    }

    target.parentElement.remove();
  });

  inputList.addEventListener("click", function (event) {
    let target = event.target;
    if (!target.classList.contains("dropdown-content")) {
      return;
    }

    addRepo(target);

    clearSearch();
    clearList();
  });

  const getReposAutocompleteDebounced = debounce(getReposAutocomplete, 500);
  inputSearch.addEventListener("input", getReposAutocompleteDebounced);
});
