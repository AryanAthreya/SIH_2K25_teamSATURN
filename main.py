from flask import Flask, request, jsonify
from flask_cors import CORS

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer

from sumy.summarizers.luhn import LuhnSummarizer
from sumy.summarizers.lex_rank import LexRankSummarizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.summarizers.text_rank import TextRankSummarizer
from sumy.summarizers.sum_basic import SumBasicSummarizer
from sumy.summarizers.edmundson import EdmundsonSummarizer
import nltk

# Ensure required resources are available
nltk.download('punkt')
nltk.download('punkt_tab')


app = Flask(__name__)
CORS(app)  # okay for dev; for prod, lock this down

SUMMARIZERS = {
    "luhn": LuhnSummarizer,
    "lexrank": LexRankSummarizer,
    "lsa": LsaSummarizer,
    "textrank": TextRankSummarizer,
    "sumbasic": SumBasicSummarizer,
    "edmundson": EdmundsonSummarizer,
}

DEFAULTS = {
    "sentences": 3,
    "algorithm": "luhn",
    "language": "english",
}

@app.get("/health")
def health():
    return jsonify({"ok": True})

@app.post("/summarize")
def summarize():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    sentences = int(data.get("sentences") or DEFAULTS["sentences"])
    algorithm = (data.get("algorithm") or DEFAULTS["algorithm"]).lower()
    language = DEFAULTS["language"]

    if not text:
        return jsonify({"error": "No text provided"}), 400

    if algorithm not in SUMMARIZERS:
        return jsonify({"error": f"Unknown algorithm '{algorithm}'"}), 400

    try:
        parser = PlaintextParser.from_string(text, Tokenizer(language))
        summarizer_cls = SUMMARIZERS[algorithm]
        summarizer = summarizer_cls()

        # Some summarizers accept optional stop_words; keeping defaults for simplicity
        summary_sentences = summarizer(parser.document, sentences)

        summary = " ".join(str(s) for s in summary_sentences)
        return jsonify({
            "summary": summary,
            "meta": {"algorithm": algorithm, "sentences": sentences}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
