# Homework 3:  Visualization Dashboard Pt 2 (Interactivity)
For this assignment, I improved upon the visualization from Homework 2 by adding animations and transitions as well as fixing bugs with the sankey plot and adding color encoding to the histogram. 

## Interactions
1. Selection: Hovering over pie chart arcs and sankey plot nodes will reveal more detail about each visualization (see below).
![](/Homework3/amaustin/demo/demo-1.gif)
2. Pan and zoom: The binwidth of the histogram is now adjustable, allowing the user to focus on different age ranges and compare the average listening hours across each range (see below).
![](/Homework3/amaustin/demo/demo-2.gif)


### A couple things:
There are some bugs with the visualizations and some general ideas I had that I was not able to implement before the deadline.
1. Showing complete breadcrumb trail in sankey plot (not just 1 level of source and target links)
2. Removing histogram bins between transitions
3. Updating color legend with binwidth adjustment
4. Dealing with outliers in data skewing color encoding and dampening the effectiveness of comparing across age ranges. For instance, most participants report 1-5 hours per day on average of listening to music, but there are participants who reported an average of 24 hours of daily music listening. This results in the histogram bars looking very similar.