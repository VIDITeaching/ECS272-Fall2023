import {useState, useEffect} from "react";
import * as d3 from 'd3';
import dataset from './pokemon_data.csv'
import './App.css';
import DonutChart from './DonutChart.js';
import ChordDiagram from './ChordDiagram.js';
import ParallelPlot from './ParallelPlot.js'

function App() {
    const randVal = Math.floor(Math.random() * 3);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataDetails, setDataDetails] = useState(false);
    const [detailView, setDetailView] = useState(false);

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
        <div className={"App-header"}><h1>Information Visualization HW #2: Visualization Dashboard</h1> <p onClick={(e) => setDetailView(!detailView)}>Detailed View  {detailView ?  "[-]" : "[+]"}</p></div>
        <h3 style={{marginBottom:10 +"px", marginTop:10 + "px"}}>Arisa Cowe</h3>
        {detailView && <h2>Dataset: Pokémon for Data Mining and Machine Learning</h2>}
        {!detailView && <h3 style={{marginTop:0 +"px"}}>Dataset: Pokémon for Data Mining and Machine Learning</h3>}
        {dataDetails &&
            <div>
                <p><a href={"https://www.kaggle.com/datasets/alopez247/pokemon/data"}>https://www.kaggle.com/datasets/faisaljanjua0555/best-video-games-of-all-time</a></p>
                <p><b>Author:</b> ALOPEZ247</p>
            <p><b>Description:</b> (Almost) all Pokémon stats until generation 6; With the rise of the popularity of machine learning, this is a good opportunity to share a wide database of the even more popular video-game Pokémon by Nintendo, Game freak, and Creatures, originally released in 1996.
                Pokémon started as a Role Playing Game (RPG), but due to its increasing popularity, its owners ended up producing many TV series, manga comics, and so on, as well as other types of video-games (like the famous Pokémon Go!).
                This dataset is focused on the stats and features of the Pokémon in the RPGs. Until now (08/01/2017) seven generations of Pokémon have been published. All in all, this dataset does not include the data corresponding to the last generation, since 1) I created the databased when the seventh generation was not released yet, and 2) this database is a modification+extension of the database "721 Pokemon with stats" by Alberto Barradas, which does not include (of course) the latest generation either.
                This database includes 21 variables per each of the 721 Pokémon of the first six generations, plus the Pokémon ID and its name.
            </p>
            <p>Full details of the 21 variables are available on the kaggle page. The ones we will be focusing on in this dashboard are:</p>
            <ul>
                <li><b>Type_1:</b> Primary type</li>
                <li><b>Type_2:</b> Second type, in case the Pokémon has it.</li>
                <li><b>Height_m:</b> Height of the Pokémon, in meters.</li>
                <li><b>Weight_kg:</b> Weight of the Pokémon, in kilograms.</li>
                <li><b>HP:</b> Base Health Points.</li>
                <li><b>Attack:</b> Base Attack.</li>
                <li><b>Defense:</b> Base Defense.</li>
                <li><b>Sp_Atk:</b> Base Special Attack.</li>
                <li><b>Sp_Def:</b> Base Special Defense.</li>
                <li><b>Speed:</b> Base Speed.</li>
            </ul> </div>}
        {detailView && <div>
            <p onClick={(e) => setDataDetails(!dataDetails)}> {dataDetails ? "[-] Close": "[+] Expand"} </p>
            <p>Before generating the visualizations, we first have to parse in the csv data.
                While the csv file is included with the project file, it cannot be used as is. Hence, we will use d3's <span>csv</span> function to parse it.
                (In React, this would be done within <span>useEffect</span> as it is an asynchronous operation.
                See React's documentation on <a href={"https://react.dev/reference/react/useEffect"}>useEffect</a> and Benny Au's <a href={"https://www.pluralsight.com/guides/load-remote-chart-data-for-d3.js-in-a-react-app"}>guide</a> and  for more details.)
                The status below is the parsing status. Once the data has been loaded in, you'll be able to see the entirety of the dashboard below
            </p>
            <h3 style={{marginBottom:0}}><b>Status:</b> {loading ? "Loading..." : "Loaded"} </h3>
        </div>}

        {loading && <p>Dataset loading...</p>}
        {!loading &&
            <div>
                {detailView && <div>
                    <h2>Seeing in Circles </h2>
                    <p> Below are two circular visualizations side-by-side, showing the <b>distribution of Pokemon</b> across their <b>18 different elemental types</b>. </p>
                    <p> On the left is a <b>donut chart</b> showing the numerical distribution of 721 pokemon across their primary typings (Type_1).
                        For context, Many pokemon, especially those in the later generations, have secondary types (i.e. they have two types) but we focus on primary typing to avoid overcounting.
                    </p>
                    <p>On the right is a <b>chord diagram</b> that shows the (directed) relationships between the pokemons' primary and secondary typings.
                        In particular, the outer arc denotes the number of pokemon with primary type X, similarly to the donut chart,
                        while the inner chord denotes the number of pokemon with secondary type Y (target) that have primary type X (source). </p>
                </div>}

                <div className={"dashboard"}>
                    <DonutChart data={data}/>
                    <svg width={100} height={360}/>
                    <ChordDiagram data={data}/>
                </div>

                {detailView && <div>
                    <br/>
                    <h2>Pokemon Physique, Power, & Parallel Plot</h2>
                    <p>Below is a <b>parallel plot</b> showing the broader relationships between physical characteristics and stats across the 721 pokemon.
                        The lines are colored by the individual pokemon's primary type per the color scheme established in the previous section.</p>
                </div>}

                <ParallelPlot data={data}/>
                <br/>
                {detailView && <div>
                    <h2>Closing Remarks</h2>
                    <p>While the advanced visualizations are interesting to look at as they are, I admit they can be hard to look at as well.
                        In the case of the parallel plot, it can be hard to identify the trends between variables between individual instances of pokemon with so many lines displayed at once. At least some of the general trends between height, weight, and stats can be easily observed, such as the zig-zags between the stats or the mass of lines converging around
                        a range of values going from height to weight. In contrast, the chord diagram proves chaotic to look at. With so many types and, in turn, so many possible 2-permutations of types, there ends up being many overlapping ribbons, some of which really narrow out at the end. As a result, it can be hard to see some of the minor type relationships
                        without zooming in or reducing the opacity of the other ribbons.
                    </p>
                    <p>For next time, I would like to add interactivity to these advanced visualizations so that it will be easier to filter visual information and see the nuances in trends and relationships.</p>
                </div>}

            </div>
        }
        <h3>References:</h3>
        <ul>
            <li><b>Donut chart:</b> <a href={"https://observablehq.com/@d3/donut-chart/2?intent=fork"}>Donut Chart Notebook</a> by Observable, <a href={"https://gist.github.com/dbuezas/9306799"}>Pie Chart Labels</a> by dbuezas on GitHub</li>
            <li><b>Chord diagram:</b> <a href={"https://d3js.org/d3-chord/chord"}>d3-chords</a> + <a href={"https://observablehq.com/@d3/chord-diagram"}>Chord Diagram I Notebook</a> by Observable</li>
            <li><b>Parallel Plot:</b> <a href={"https://d3-graph-gallery.com/graph/parallel_custom.html"}>Parallel coordinates chart with color effect</a> by Yan Holtz on D3.js Graph Gallery</li>
        </ul>

    </div>
  );
}

export default App;
