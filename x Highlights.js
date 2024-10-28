
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

async function fetchTwitterHighlights() {
    try {
        const response = await fetch('/api/twitter-highlights');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Airtable Response:', data);

        if (data.records && data.records.length > 0) {
            const srefTweets = data.records.filter(record => record.fields.Type === 'SREF');
            const videoTweets = data.records.filter(record => record.fields.Type === 'Video');
            
            console.log('SREF Tweets:', srefTweets);
            console.log('Video Tweets:', videoTweets);

            displayTweets(srefTweets, 'srefTwitterTable');
            displayTweets(videoTweets, 'videoTwitterTable');
        } else {
            console.log('No tweets found');
            displayNoTweetsMessage('srefTwitterTable');
            displayNoTweetsMessage('videoTwitterTable');
        }
    } catch (error) {
        console.error('Error fetching data from Airtable:', error);
        displayErrorMessage('srefTwitterTable');
        displayErrorMessage('videoTwitterTable');
    }
}

function displayTweets(tweets, tableId) {
    const twitterTable = document.getElementById(tableId).querySelector('tbody');
    twitterTable.innerHTML = ''; // Clear existing content

    console.log(`Displaying tweets for ${tableId}:`, tweets);

    if (tweets.length === 0) {
        displayNoTweetsMessage(tableId);
        return;
    }

    const row = document.createElement('tr');
    
    tweets.forEach(tweet => {
        const tweetHTML = tweet.fields.Blockquote;

        console.log('Processing tweet:', tweet);
        
        if (tweetHTML) {
            const correctedHTML = tweetHTML.replace(/\\_/g, '_');
            
            const urlMatches = correctedHTML.match(/https:\/\/twitter\.com\/.*\/status\/\d+/);
            if (urlMatches) {
                const tweetURL = urlMatches[0];
                console.log('Extracted Tweet URL:', tweetURL);

                const cell = document.createElement('td');
                const embedDiv = document.createElement('div');
                embedDiv.className = 'twitter-embed';
                embedDiv.innerHTML = correctedHTML;
                cell.appendChild(embedDiv);
                row.appendChild(cell);
            } else {
                console.warn('No valid URL found in blockquote:', correctedHTML);
            }
        } else {
            console.warn('Blockquote is undefined for this tweet:', tweet);
        }
    });

    twitterTable.appendChild(row);

    if (window.twttr && window.twttr.widgets) {
        twttr.widgets.load();
    } else {
        console.warn('Twitter widget script not loaded yet. Tweets may not render immediately.');
    }
}

function displayNoTweetsMessage(tableId) {
    const twitterTable = document.getElementById(tableId).querySelector('tbody');
    twitterTable.innerHTML = '<tr><td>No tweets found for this category.</td></tr>';
}

function displayErrorMessage(tableId) {
    const twitterTable = document.getElementById(tableId).querySelector('tbody');
    twitterTable.innerHTML = '<tr><td>Error loading tweets. Please try again later.</td></tr>';
}

// Fetch tweets when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchTwitterHighlights);