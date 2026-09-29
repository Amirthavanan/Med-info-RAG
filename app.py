import streamlit as st
from rag.pipeline import index_pdf, answer_question
from rag.vector_store import get_collection, clear_collection

st.set_page_config(
    page_title="MedInfo RAG",
    page_icon="💊",
    layout="wide",
)

st.title("💊 MedInfo RAG")
st.caption("Drug Information Assistant grounded in uploaded drug-label documents")

with st.sidebar:
    st.header("Knowledge Base")
    count = get_collection().count()
    st.metric("Indexed chunks", count)

    if st.button("Clear knowledge base", type="secondary"):
        clear_collection()
        st.session_state.messages = []
        st.success("Knowledge base cleared.")
        st.rerun()

    st.divider()
    st.markdown(
        "**Scope:** document-grounded drug information only. "
        "This app is not a diagnostic or prescribing tool."
    )

tab1, tab2 = st.tabs(["📄 Upload & Index", "💬 Ask MedInfo"])

with tab1:
    st.subheader("Upload drug labels")
    st.write("Upload PDF prescribing information, Medication Guides, or Drug Facts documents.")
    uploads = st.file_uploader(
        "Choose PDF files",
        type=["pdf"],
        accept_multiple_files=True,
    )

    if uploads and st.button("🚀 Index documents", type="primary"):
        for uploaded in uploads:
            with st.spinner(f"Indexing {uploaded.name}..."):
                try:
                    result = index_pdf(uploaded, uploaded.name)
                    st.success(
                        f"{uploaded.name}: {result['pages']} pages → "
                        f"{result['chunks']} chunks"
                    )
                except Exception as exc:
                    st.error(f"{uploaded.name}: {exc}")

with tab2:
    st.subheader("Ask about an indexed medicine")

    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            if message.get("sources"):
                with st.expander("📚 Retrieved sources"):
                    for i, src in enumerate(message["sources"], 1):
                        st.markdown(
                            f"**{i}. {src['source']} — page {src['page']}**"
                        )
                        st.caption(src["text"])

    question = st.chat_input(
        "Example: What warnings are listed for this medicine?"
    )

    if question:
        st.session_state.messages.append({
            "role": "user",
            "content": question,
        })
        with st.chat_message("user"):
            st.markdown(question)

        with st.chat_message("assistant"):
            with st.spinner("Retrieving drug-label information..."):
                try:
                    result = answer_question(question)
                    st.markdown(result["answer"])
                    with st.expander("📚 Retrieved sources"):
                        for i, src in enumerate(result["sources"], 1):
                            st.markdown(
                                f"**{i}. {src['source']} — page {src['page']}**"
                            )
                            st.caption(src["text"])
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": result["answer"],
                        "sources": result["sources"],
                    })
                except Exception as exc:
                    st.error(str(exc))
