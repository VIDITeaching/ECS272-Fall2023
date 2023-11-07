import {useState, useEffect} from "react";
import * as d3 from 'd3';
import dataset from './pokemon_data.csv'
import './App.css';
import DonutChart from './DonutChart.js';
import ChordDiagram from './ChordDiagram.js';
import ParallelPlot from './ParallelPlot.js'

const typeColors = {
    Normal: "#A8A77A",
    Fire: "#EE8130",
    Water: "#6390F0",
    Grass: "#7AC74C",
    Flying: "#A98FF3",
    Fighting: "#C22E28",
    Poison: "#A33EA1",
    Electric: "#F7D02C",
    Ground: "#E2BF65",
    Rock: "#B6A136",
    Psychic: "#F95587",
    Ice: "#96D9D6",
    Bug: "#A6B91A",
    Ghost: "#735797",
    Steel: "#B7B7CE",
    Dragon: "#6F35FC",
    Dark: "#705746",
    Fairy: "#D685AD",
}
function App() {
    const randVal = Math.floor(Math.random() * 3);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailView, setDetailView] = useState(false);
    const [selectType, setSelectType] =  useState("")

    function resetCharts(){
        d3.selectAll(".piePieces").transition().duration(350).attr("fill-opacity", 1)
        d3.selectAll(".pieText").transition().duration(350).attr("fill-opacity", 1)
        d3.selectAll(".polylines").transition().duration(350).attr("stroke-opacity", 1)
        d3.selectAll(".ribbons").transition().duration(350).attr("fill-opacity", 0.7).attr("stroke-opacity", 1)
        d3.selectAll(".pplines").raise()
        d3.selectAll(".pplines").transition().duration(350).style("stroke", function (){
            let typeStr = this.id.substring(3)
            return typeColors[typeStr]
        }).style("opacity", 0.4)
        d3.selectAll(".axis").raise();
    }

    // Since d3.csv is an asynchronous function,
    // we need to use UseEffect in loading and parsing the data
    useEffect(() => {
        d3.csv(dataset).then((d) => {
            setData(d)
            setLoading(false)
        })
        return () => undefined
    }, [])

    // Pie/donut chart to show types
    // Chord graph to show relations of first and second types
    // Parallel set or coordinate graph showing relationships between body type, primary egg group, and maybe stats
    // <p>Here, have a {data[(3 * randVal)].Name}!</p>
  return (
    <div className="App">
        <h1 className={"App-header"}>Interactive Visualization Dashboard for Pokemon Data</h1>
        {selectType}
        {loading && <p>Dataset loading...</p>}
        {!loading &&
            <div>
                <div className={"dashboard"}>
                    <DonutChart data={data} resetCharts={resetCharts}/>
                    <svg width={100} height={410} />
                    <ChordDiagram data={data} resetCharts={resetCharts}/>
                </div>
                <ParallelPlot data={data} resetCharts={resetCharts}/>
            </div>
        }
        {detailView &&
            <div className={"details"}>
                <h2>Dataset: Pokémon for Data Mining and Machine Learning</h2>
                <p><a href={"https://www.kaggle.com/datasets/alopez247/pokemon/data"}>https://www.kaggle.com/datasets/faisaljanjua0555/best-video-games-of-all-time</a></p>

                <h2>Description:</h2>
                <p> This interactive visualization aims to show the <b>distribution of 721 Pokemon</b> across their <b>18 (primary) elemental types</b>,
                    the distribution of secondary types across each primary type, and the relation between a pokemon's type and their physical characteristics (height and weight) and battle stats (HP, attack, defense, special attack, special fefense, and speed).</p>

            <p> The two circular visualizations each show the <b>distribution of Pokemon</b> across <b>18 different elemental types</b>. </p>
            <p> In particular, the <b>donut chart</b> shows the numerical distribution of <b>721 pokemon</b> across their <b>primary typings</b> (Type_1).
                For context, Many pokemon, especially those in the later generations, have secondary types (i.e. they have two types) but we focus on primary typing to avoid overcounting.
            </p>

            <p>The <b>chord diagram</b> on the right shows the (directed) relationships between the <b>pokemons' primary and secondary typings</b> for
                the <b>350 pokemon</b> that have two types. In particular, the outer arc denotes the number of pokemon with primary type X, similarly to the donut chart,
                while the inner chord denotes the number of pokemon with secondary type Y (target) that have primary type X (source). </p>

            <p> Finally, the <b>parallel plot</b> at the bottom shows the broader relationships between <b>type, physical characteristics, and battle stats</b> across the <b>721 pokemon</b>.
                The lines are colored by the individual pokemon's primary type per the color scheme established in the donut chart.</p>

                <h2>Interactions:</h2>
                <ol>
                    <li><b>Global filtering by primary type for donut chart selection:</b> You can filter displayed data by primary type across all charts by clicking on the corresponding donut chart segment for that type. Double click on any pie chart segment to revert to the default view.</li>
                    <li><b>Local filtering by primary type for chord diagram selection:</b> You can filter displayed ribbons by primary type for by clicking on the corresponding arc segment or ribbons. Double click on any segment or ribbon to revert to the default view.</li>
                    <li><b>Brushing for parallel coordinate plot:</b> For each axis, you can select groups of lines to highlight by clicking on the axis, then dragging the box to enclose the desired region. Double click on axis (or refresh page) to revert to default view.</li>
                </ol>
                <h2>References:</h2>
                <ul>
                    <li><b>Donut chart:</b> <a href={"https://observablehq.com/@d3/donut-chart/2?intent=fork"}>Donut Chart Notebook</a> by Observable, <a href={"https://gist.github.com/dbuezas/9306799"}>Pie Chart Labels</a> by dbuezas on GitHub</li>
                    <li><b>Chord diagram:</b> <a href={"https://d3js.org/d3-chord/chord"}>d3-chords</a> + <a href={"https://observablehq.com/@d3/chord-diagram"}>Chord Diagram I Notebook</a> by Observable</li>
                    <li><b>Parallel Coordinates:</b> <a href={"https://d3-graph-gallery.com/graph/parallel_custom.html"}>Parallel coordinates chart with color effect</a> by Yan Holtz on D3.js Graph Gallery</li>
                    <li><b>Parallel Coordinate Brushing:</b> <a href={"https://observablehq.com/@d3/brushable-parallel-coordinates"}>Brushable parallel coordinates</a> by Kerry Rodden on Observable</li>
                    <li><b>D3 Event Listeners:</b> <a href={"https://gramener.github.io/d3js-playbook/events.html"}>Event Listeners</a> in D3.js Playbook by Pratap Vardhan </li>
                </ul>
        </div>}
        <p className={"details"} onClick={(e) => setDetailView(!detailView)}> {detailView ?  "[-] Close" : "[+] Additional details"}</p>

    </div>
  );
}

export default App;
