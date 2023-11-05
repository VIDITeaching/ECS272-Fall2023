import pandas as pd

df = pd.read_csv("./mxmh_survey_results.csv")

df = df.dropna()

json_data = df.to_json(orient='records')

with open('mxmh_survey_results.json', 'w') as json_file:
    json_file.write(json_data)