# Homework 2: Visualization Dashboard: Layout Design + Visual Encoding
For homework 2, you will create a dashboard with three visualization views. This homework will not be using Observable. Instead, you will be developing a web-based interface in JavaScript with [D3.js](https://d3js.org/), where we have provided two templates.

To begin, you need to first fork this repository.
After the fork, clone the repository using the following commands:

```bash
  git clone https://github.com/<your-github-account-name>/ECS272-Fall2023
  cd ECS272-Fall2023/Homework2 
```
    
Create a new folder inside the Homework 2 directory in the forked repository. The name of the folder should be the same as your UC Davis email account name (without ' @ucdavis.edu'). **Inside this folder, you will add all your code.**

Before coding, please go over one of the following tutorials:

* D3.js : [Introduction](https://d3js.org/#introduction), [Core concepts](https://d3-graph-gallery.com/intro_d3js.html), [Selection](https://www.d3indepth.com/selections/), [Data Joins](https://www.d3indepth.com/datajoins/)

If you need to learn more about JavaScript, you can refer to [A re-introduction to JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)

---

## Step 0: Choose a Dataset from the Following List
In this assignment, you can choose one of the following datasets:

* [Data Science Job Salary](https://www.kaggle.com/datasets/arnabchaki/data-science-salaries-2023)
* [Global Terrorism Database](https://www.kaggle.com/START-UMD/gtd)
* [Cosmetics](https://www.kaggle.com/datasets/kingabzpro/cosmetics-datasets)
* [Fitness Consumer Survey](https://www.kaggle.com/datasets/harshitaaswani/fitness-consumer-survey-data)
* [Student Mental Health](https://www.kaggle.com/datasets/shariful07/student-mental-health)
* [Student Alcohol Consumption](https://www.kaggle.com/uciml/student-alcohol-consumption)
* [Music and Mental Health Survey](https://www.kaggle.com/datasets/catherinerasgaitis/mxmh-survey-results)
* [List of Historical Ballot Measures in SF](https://data.sfgov.org/City-Management-and-Ethics/List-of-Historical-Ballot-Measures/xzie-ixjw)
* [Pokemon](https://www.kaggle.com/alopez247/pokemon)

  
To use a dataset, download the data file from the respective URL above and put it in the `./<your-template>/data` folder.

## Step 1: Set Up the Environment
We have provided two templates; one in TypeScript using [Vue 3](https://vuejs.org/guide/introduction.html), and the other in vanilla Javascript. Both are built with the help of [Vite](https://vitejs.dev/guide/). You can find them and more technical details in `./Homework2/Vue-Template` and `./Homework2/VanillaJS-Template`.

Vue.js is designed from the ground up to be incrementally adoptable. The core library is focused on the view layer only, and is easy to pick up and integrate with other libraries or existing projects. On the other hand, Vue is also perfectly capable of powering sophisticated Single-Page Applications when used in combination with modern tooling and supporting libraries.

Note that you are free to use other existing frameworks and libraries in JavaScript/TypeScript to implement your interface, while d3.js remains required for completing this assignment.
For example, [React](https://reactjs.org/tutorial/tutorial.html) is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called “components”.

If you use a framework or library to create your system, please provide a `README.md` file explaining all the steps to run and view your system.



Install [node.js](https://nodejs.org/en/) if not yet. <br />
Make sure the node.js version is either v14.18.0+ or v16.0.0+, which is **required** for Vite to work normally.

Both templates have the same setup process, as described below.

Install packages from package.json
```bash
  cd ./Vue-Template # Or ./VanillaJS-Template, your choice.
  npm install
```
To start the application, run
```bash
  npm run dev
```
You can then visit `localhost:3000` in the browser to see the interface.

Install additional packages for your needs
```bash
  npm install <package0-name>
```

\*This template has been tested with Node.js v19.3.0.


# Requirements
Your task is to create a visualization dashboard. The design of this dashboard should facilitate the exploration of a dataset in an effective or interesting way.

* This dashboard must have three visualization views, which should be created with different visualization methods (see below).
* Your visualizations should include at least one advanced visualization method.
* The visualizations should depict different dimensions or aspects of the dataset to be examined. 
* The three visualizations should fit on a fullscreen browser. Consider where each view should be placed while designing the layout of your dashboard.
* **Legends** for each view need to be provided as well as **axis labels** and **chart titles**.
* One of your three views should serve as an overview of the data.
* Choose appropriate visual encodings.
* Color choice matters and has an effect on the interpretability of the visualization. Depending on the data the type of color scale you will use will change (categorical, linear, etc).
* Carefully consider the design for each encoding that you will use and its effectiveness for portraying the data.  Depending on the data you are visualizing, certain pairings of marks and channels will be more effective.

The design paradigm you will be following is referred to as focus + context. 

* A focus view is where the data of most interest is displayed at full size or with full details.
* A context view is a peripheral zone, an overview,  where elements are displayed at reduced size or in a simplified way.
For each view, you need to provide one or more visual interface widgets (e.g., a dropdown menu or slider) for changing the parameters of the visualization. For example, a drop-down menu can be provided for selecting the data dimension that maps to the x-axis of a scatter plot or the color encoding used in a 2D heatmap.

Note that creating a bar chart and a histogram only counts as using only one method, since their implementation is nearly the same.

**Fundamental**
* Bar chart or histogram
* Pie or donut chart
* Line and area chart
* 2D heatmap or matrix view
* Scatter plot
* Node-link diagram
* Geographical map

**Advanced**
* Parallel set or parallel coordinates plot
* Sankey or alluvial diagram
* Star coordinates or plot
* Chord diagram
* Stream graph
* Arc diagram
* Dendrogram

# Submission
To submit for this assignment, you need to first [fork](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo) this [repository](https://github.com/VIDITeaching/ECS272-Fall2023). After the fork, clone the forked repository using the following commands: 
```bash
  git clone https://github.com/<your-github-account-name>/ECS272-Fall2023
  cd ECS272-Fall2023/Homework2
```

Create a new folder inside the Homework 2 directory in the forked repository. The name of the folder should be the same as your UC Davis email account name (without ' @ucdavis.edu'). Put all your codes inside this folder, and use "git add" to add all your codes, and then commit. 
```bash
git add <your-filename> 
git commit -m "Homework2" 
git push
```
After you pushed your code to your repository, follow the instruction [here](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork) to create a pull request for this repository. Finally, submit the hyperlink of the pull request to UCD Canvas. The hyperlink should look like - "https://github.com/VIDITeaching/ECS272-Fall2023/pull/{your-pull-request-id}".
