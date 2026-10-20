import pandas as pd

path = "definitions.txt"
out_file = "definitionstable.txt"

out_string = r"""<table>
<tr>
<th>Term</th>
<th>Definition</th>
</tr>
"""

# terms = pd.DataFrame(columns=["Term", "Definition"])

terms = []

with open(path, "r") as f:
    all_text = f.readlines()

    for line in all_text:
        tmp = line.strip().split(" : ")
        print(tmp)
        word, definition = tmp[0], tmp[1]

        terms.append({"Term" : word,
                      "Definition" : definition})

terms = pd.DataFrame(terms)

sorted = terms.sort_values(by="Term")

for row in sorted.itertuples():

        out_string += fr"""
<tr>
<td id="{row.Term}">{row.Term.upper()}</td>
<td>{row.Definition}</td>
</tr>
"""

out_string += rf"</table>"

with open(out_file, "w") as new_f:
    new_f.write(out_string)

print(out_string)