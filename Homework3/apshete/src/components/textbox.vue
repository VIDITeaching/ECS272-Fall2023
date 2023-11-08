<template>
    <div class="text-box">
      <h2>Visualization Information</h2>
      <p> <span class="underline-text">Sankey Chart</span>: The Sankey chart connects data science job titles to experience levels, 
        with band widths indicating average salaries. Wider bands represent higher
        salaries for specific roles and experience brackets.</p>

        <p> <span class="underline-text">Surface Plot</span>: The surface plot displays the relationship between "Company Size" (small, medium, large), 
            "Employment Type" (part-time, full-time, contract, freelance), and "Salary in USD", with colors indicating the work year. 
            Analyze salary trends over time across different employment types and company sizes.</p>
    </div>
  </template>

<style scoped>
.text-box {
  position: absolute;
  top: 5%;  
  right: 30px;  
  border: 1px solid #000;  /* Border color */
  padding: 10px;           /* Inner spacing */
  width: 300px;            /* Width */
  height: 400px;           /* Height */
  background-color: #fff; /* Background color */
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1); /* Optional shadow */
}

.text-box p {
  font-size: 12px;  /* Adjust this value to your desired font size */
  margin-top: 20px;
  margin-bottom: 20px;
}
.underline-text {
    text-decoration: underline;
}
</style>