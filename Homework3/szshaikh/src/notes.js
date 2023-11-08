import createScatterPlot from './viz3.js';

export const Notes = () => (`
    <div class='card' id='note-card'>
        <div class="card-content">
            <div id='scatter-container'></div> 
        </div>
    </div>
`);


document.addEventListener('DOMContentLoaded', (event) => {
    const container = document.querySelector('#scatter-container');
    container.appendChild(createScatterPlot());
});
