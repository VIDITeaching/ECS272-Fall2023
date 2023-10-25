# Homework 1: Static Visualizations with Observable Notebook
In this homework, you will be getting familiar with visualizations using [Observable Notebook](https://observablehq.com/). 
Your task is to create at least three visualizations from a dataset of your choice, then present two or more insights dervied from your work.
Observable introduces the notebook paradigm to JavaScript projects. If you are familiar with Jupyter notebooks, this is the equivalent to JavaScript instead of Python. 

This is an individual assignment, so you may not work in groups. Your final submission will take the form of a report, including the visualizations you will create and the description of the insights you will gain from your visualizations.

A full example of visualization and analysis of a multidimensional dataset using D3.js and Vega-Lite can be found in [here](https://observablehq.com/d/2600cf5224a01f25). Note that for D3.js, please use version v6 or v7 (the latest). Versions earlier than v6 use very different and outdated syntax.

* An Observable Tutorial:  [Five-Minute Introduction to Observable](https://observablehq.com/@observablehq/five-minute-introduction) 

Before coding, please go over some of the following tutorials:

* D3.js : [Introduction](https://d3js.org/#introduction), [Core concepts](https://d3-graph-gallery.com/intro_d3js.html), [Selection](https://www.d3indepth.com/selections/), [Data Joins](https://www.d3indepth.com/datajoins/)

If you need to learn more about JavaScript, you can refer to [A re-introduction to JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)

---

## Step 0: Setting Up Observable
Before you begin creating and editing a notebook, you will first need to create an account with [Observable Notebook](https://observablehq.com/). Open a web browser, navigate to [Observable Notebook](https://observablehq.com/), click sign in, and continue with either your GitHub account or one of the other options. After successfully logging in, you can then create a new blank notebook. To open a blank notebook, click the icon next to your profile picture in the top right-hand corner of the page. The icon will be to the left of your profile picture.

## Step 1: Choose a Dataset from the Following List
Each of the following datasets can be downloaded as CSV files.

* [Best Video Games of All Time](https://www.kaggle.com/datasets/faisaljanjua0555/best-video-games-of-all-time)
* [Titanic Survival](https://www.kaggle.com/datasets/brendan45774/test-file)
* [Employee Productivity](https://archive.ics.uci.edu/dataset/597/productivity+prediction+of+garment+employees)
* [CO2 Emissions Around the World](https://www.kaggle.com/datasets/koustavghosh149/co2-emission-around-the-world)


**Loading the Data**
For Observable, you can attach datasets as CSV files. To do so, first make sure you have opened either an existing observable notebook or an empty notebook, using your account. Select the (...) botton on the top right (located next to Publish and Like buttons), which will open a drop-down menu. Select the option "File Attachments". You should now see a menu on the right-hand side where you can upload your data (Max file size: 15MB).

## Step 2: Process and Visualize the Data
Once the chosen dataset is loaded into the Observable notebook, you can begin processing the data for visualization. For data processing, vanilla JavaScript should be sufficient. However, feel free to use any Javascript library for processing and analyzing the data. 

After data processing, you should have some subsets of the data you seek to visualize. **We encourage you to use D3.js to create visualizations, as D3.js is required for future homework and the final project.**

Two libraries you may use in this assignment: [Observable Plot](https://observablehq.com/@observablehq/plot-gallery) and [Vega-Lite](https://vega.github.io/vega-lite/).
Observable Plot allows you to visualize data in an efficient manner on Observable.
Vega-Lite provides a more concise and convenient form to author common visualizations. 
**While you may use these libraries to gain familiarity with visualizations in this homework, BOTH WOULD NOT BE ALLOWED in HW2, HW3, and the final project.**
On a side note, we will use Observable Plot in workshops.

### Example
An example of visualization and analysis of a multidimensional dataset using D3 can be found in [this Observable Notebook](https://observablehq.com/d/2600cf5224a01f25). You may refer to this notebook; however, **if you submit this exact visualization and analysis you will not receive any credit**.

---

## Requirements
You need to create **at least three different visualizations**, and you need to describe at least two insights (e.g. useful or important information) from your visualizations. 

### Examples of Visualization Methods

Note that you have to pick different methods for each of your visualizations. For example, creating a bar chart and a histogram only counts as using only one method, since their implementation is nearly the same.

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

### Insights from the Visualizations

By inspecting both the individual visualizations and seeing these visualizations side by side you should be able to see relationships or patterns within the data that you wouldn't have noticed by staring at a CSV file. Comment on these relationships. In Observable notebooks, you can use the "Text" blocks to write down your insights.

## Submission
For Observable notebooks, enable link sharing for your notebook and submit the link to HW1 in UCD Canvas.