from flask import Flask, jsonify, request
import os, sys, string, unirest, json

app = Flask(__name__)
def breakdown(data):
    listline = []
    
    for d in data.json['data']:
        line = sentiment(d['comment'])
        listline.append(line)
    return listline

def sentiment(line):
    response = unirest.post("https://twinword-sentiment-analysis.p.mashape.com/analyze/",
    headers = {
        "X-Mashape-Key": "5Lp4CsaUdumshPEhw8A2y4BzEd5Zp1eEuMYjsnuBXcuRF1F17F",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"},
    params = {"text": line})
    decision = response.body['score']

    if float(decision) < 0:
        token = []
        for k in response.body['keywords']:
            if float(k['score']) < 0:
                token.append(k['word'])

        token.sort(key = len, reverse = True)
        for t in token:
            line = line.replace(' ' + t.title(), ' <h>' + t.title() + '</h>')
            line = line.replace(' ' + t.upper(), ' <h>' + t.upper() + '</h>')
            line = line.replace(' ' + t, ' <h>' + t + '</h>')
        line = line.replace('</h> <h>', ' ')
    return line + '|' + str(decision)

def build(listline, data):
    i = 0
    for d in data.json['data']:
        d['score'] = listline[i].split('|')[1]
        d['comment'] = listline[i].split('|')[0]
        i += 1
    return data

@app.route('/api/nlp', methods = ['POST'])
def home():
    print 'print request'
    print request.data
    print 'after print'
    listline = breakdown(request)
    res = build(listline, request)
    return jsonify({'data': res.json['data']})

if __name__ == '__main__':
    app.run(debug = True)