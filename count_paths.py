import json
d=json.load(open(r"c:\Dev\New-Hype-Project\apidocs.json"))
paths=sorted(d.get("paths",{}).keys())
methods=0
for p in paths:
    ms=[m for m in d["paths"][p].keys() if m in ("get","post","put","delete","patch")]
    methods+=len(ms)
    print(f"  {p}: {ms}")
print(f"Total paths: {len(paths)}, Total endpoints: {methods}")
