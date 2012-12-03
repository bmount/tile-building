# coding: utf-8

import json, psycopg2

fout = open('parcelcollection.json', 'w')
conn = psycopg2.connect(database='buildingfootprints')
cur = conn.cursor()


ctr = [-122.410312, 37.761012]

w = .003

x0 = ctr[0]-w
y0 = ctr[1]-w
x1 = ctr[0]+w
y1 = ctr[1]+w

#cur.execute("""select *, st_asgeojson(st_transform(sfootprint, 4326)) from
cur.execute("""select *, st_asgeojson(sfootprint) from
sbldgs where sfootprint &&
st_transform(st_envelope(st_geomfromtext('LINESTRING(%s %s,
%s %s)', 4326)), 900913)""", (x0,y0,x1,y1))
rv = cur.fetchall()
f = {"type":"FeatureCollection", "features":[]}
for i in rv:
    f['features'].append({"geometry":json.loads(i[2]), "properties":{"height":float(i[1])}})

fout.write(json.dumps(f))


