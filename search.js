const peopleList = document.getElementById('peopleList');
const searchBar = document.getElementById('searchBar');
let currentPage = 1;
const pageSize = 10;

const fetchPeople = async (searchTerm, page = 1) => {
    try {
        const response = await fetch(`/people?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=${pageSize}`);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};


const displayPeople = (data) => {
    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
        peopleList.innerHTML = '<div>No people found or there was an error fetching the data.</div>';
        return;
    }


    const headerHtml = `
        <div class="person-details-header">
            <div class="detail-label">First Name</div>
            <div class="detail-label">Last Name</div>
            <div class="detail-label">Age</div>
            <div class="detail-label">Race</div>
            <div class="detail-label">Gender</div>
        </div>
    `;
    peopleList.innerHTML = headerHtml; 


    data.results.forEach((person, index) => {
        const personElement = document.createElement('div');
        personElement.className = 'character';
        personElement.innerHTML = `
        <div class="person-summary" onclick="toggleDetails('details-${index}', this)">
                <div class="detail-value">${person.First_Name}</div>
                <div class="detail-value">${person.Last_Name}</div>
                <div class="detail-value">${person.Age}</div>
                <div class="detail-value">${person.Race}</div>
                <div class="detail-value">${person.Gender}</div>
                <div class="toggle-icon">+</div>
            </div>
            <div id="details-${index}" class="person-details" style="display: none;">
                Street: ${person.Street}, Address: ${person.Address}, Occupation: ${person.Occupation}, Business: ${person.Organization_Name}, Owned/Rented: ${person.Resident_Info}<br>
                Source Year: ${person.Source_Year}, Source Type: ${person.Source_Type}, Notes: ${person.Notes}, Other Names: ${person.Other_Nms}
            </div>
        `;

        peopleList.appendChild(personElement);
    });

    document.querySelectorAll('.person-details').forEach(el => el.style.display = 'none');
};


function toggleDetails(detailsId, summaryElement) {
    const detailElement = document.getElementById(detailsId);
    const allDetails = document.querySelectorAll('.person-details');
    const allSummaries = document.querySelectorAll('.person-summary');

    const isCurrentlyVisible = detailElement.style.display === 'block';


    allDetails.forEach(detail => detail.style.display = 'none');
    allSummaries.forEach(summary => summary.querySelector('.toggle-icon').textContent = '+');

    if (!isCurrentlyVisible) {
        detailElement.style.display = 'block';
        summaryElement.querySelector('.toggle-icon').textContent = '-';
    } else {
        detailElement.style.display = 'none';
        summaryElement.querySelector('.toggle-icon').textContent = '+';
    }
}

function setPage(newPage) {
    currentPage = newPage;
    fetchPeople(searchBar.value.trim(), currentPage).then(data => {
        if (data) {
            displayPeople(data);
            updatePaginationControls(data.totalCount, currentPage); 
        }
    }).catch(error => console.error('Fetching people failed:', error));
}

const updatePaginationControls = (totalCount, currentPage) => {
    const paginationControls = document.getElementById('paginationControls');
    const totalPages = Math.ceil(totalCount / pageSize);
    const maxPagesToShow = 5; 
    let startPage, endPage;
    if (totalCount !== lastTotalCount && currentPage !== 1) {
        setPage(1);
    } else {
    if (totalPages <= maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    } else {
        
        const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
        const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrentPage) {
           
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
           
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            
            startPage = currentPage - maxPagesBeforeCurrentPage;
            endPage = currentPage + maxPagesAfterCurrentPage;
        }
        }
        lastTotalCount = totalCount;
    }

    
    paginationControls.innerHTML = '';

    
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => setPage(currentPage - 1);
    paginationControls.appendChild(prevButton);

   
    if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.textContent = '1';
        firstPageBtn.onclick = () => setPage(1);
        paginationControls.appendChild(firstPageBtn);
        if (startPage > 2) {
            paginationControls.appendChild(document.createTextNode('...'));
        }
    }

    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.disabled = i === currentPage;
        pageButton.onclick = () => setPage(i);
        paginationControls.appendChild(pageButton);
    }

    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationControls.appendChild(document.createTextNode('...'));
        }
        const lastPageBtn = document.createElement('button');
        lastPageBtn.textContent = totalPages.toString();
        lastPageBtn.onclick = () => setPage(totalPages);
        paginationControls.appendChild(lastPageBtn);
    }

   
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage >= totalPages;
    nextButton.onclick = () => setPage(currentPage + 1);
    paginationControls.appendChild(nextButton);
};


const createPaginationControls = () => {
   
    const paginationControls = document.getElementById('paginationControls');
    paginationControls.innerHTML = '';  
};


searchBar.addEventListener('input', async () => {
    
    const searchTerm = searchBar.value.trim();
    setPage(1); 
});

window.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchPeople('', currentPage);
    if (data) displayPeople(data);
});
window.addEventListener('DOMContentLoaded', () => {
    setPage(1); 
});
let lastTotalCount = 0;
