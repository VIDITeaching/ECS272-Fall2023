import pandas as pd

# Reading the data
# df = pd.read_csv("pokemon_alopez247.csv")

# Understanding the data
'''
print(df.head())
print(df.columns)
for col in df.columns:
	print(col)
	print(df[col].unique())
	print("\n\n")
'''

# Only "Pr_Male" column contains nan values so it is ignored as I do not consider this column in my visualizations

# Obtaining aggregated data for RadarPlot.vue
'''
print("HP", df.HP.mean())
print("Sp_Atk", df.Sp_Atk.mean())
print("Attack", df.Attack.mean())
print("Sp_Def", df.Sp_Def.mean())
print("Defense", df.Defense.mean())
print("Speed", df.Speed.mean())
radar_columns = ['HP', 'Sp_Atk', 'Attack', 'Sp_Def', 'Defense', 'Speed']
category_map = {'HP': "HP", 'Sp_Atk': "Sp. Attack", 'Attack': "Attack", 'Sp_Def': "Sp. Defense", 'Defense': "Defense", 'Speed': "Speed"}
radar_data = {"data": []}
for col in radar_columns:
	current_dict = {"value": int(round(df[col].mean(), 0)), "max-value": max(df[col].tolist()), "category": category_map[col]}
	radar_data["data"].append(current_dict)
print(radar_data)
import json
with open('radar_data.json', 'w') as outfile:
	json.dump(radar_data, outfile)
'''


# Obtaining individual pokemon data for RadarPlot.vue
# '''
df = pd.read_csv("pokemon_alopez247.csv")
print(df.columns)
# exit()
header = ["Pokemon", "Generation", "HP", "Attack", "Defense", "Speed", "SpAttack", "SpDefense"]
rows = []
for i in range(len(df)):
	Name = str(df.iloc[i]["Name"])
	Generation = int(df.iloc[i]["Generation"])
	HP = int(df.iloc[i]["HP"])
	SpAttack = int(df.iloc[i]["Sp_Atk"])
	Attack = int(df.iloc[i]["Attack"])
	SpDefense = int(df.iloc[i]["Sp_Def"])
	Defense = int(df.iloc[i]["Defense"])
	Speed = int(df.iloc[i]["Speed"])
	row = [Name, Generation, HP, Attack, Defense, Speed, SpAttack, SpDefense]
	rows.append(row)

import csv
with open("pokemon_radar_data.csv", 'w') as csvfile:  
    csvwriter = csv.writer(csvfile)  
    csvwriter.writerow(header)  
    csvwriter.writerows(rows)
    csvfile.close()
# '''


# Obtaining data for BarPlot.vue
'''
# Group by 'Type_1' and count categories in 'Generation'
bar_data = pd.crosstab(index=df['Type_1'], columns=df['Generation'])
bar_data.reset_index(level=0, inplace=True)
bar_data.reset_index(drop=True, inplace=True)
bar_data.to_csv("bar_data.csv", index=False)
print(bar_data)
'''

