import re
import numpy as np
import pandas as pd
import datetime
from typing import List, Dict, Any, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# -----------------
# 1. Classification & Priority Model
# -----------------
# Training corpus of common residential community complaints
TRAINING_DATA = [
    # Plumbing
    ("Water leakage from Wing A kitchen pipes, flooding the floor.", "Plumbing", "High", "Active water leak causing flooding is a high priority plumbing emergency."),
    ("Taps in the toilet are leaking water continuously.", "Plumbing", "Medium", "Constant leak from bathroom taps leads to water waste and requires medium attention."),
    ("Clogged bathroom drain in Flat 402, water not draining.", "Plumbing", "Medium", "Drain blockage in a bathroom is a standard plumbing issue requiring quick resolution."),
    ("Low water pressure in the master bathroom shower.", "Plumbing", "Low", "Shower water pressure is a convenience issue, classified as low priority."),
    ("Main sewer line backup in the basement area, foul smell.", "Plumbing", "High", "Sewer line blockage affects public hygiene and is a high priority emergency."),
    
    # Electrical
    ("Sparking sound from the electric meter box on floor 5.", "Electrical", "High", "Electrical sparking is a severe fire hazard, requiring immediate emergency intervention."),
    ("Power outage in Wing B, entire corridor lights are out.", "Electrical", "High", "Corridor power outage compromises safety and security for residents."),
    ("Flickering tube light in the basement parking lobby.", "Electrical", "Low", "Flickering lobby light is a minor fixture issue, classified as low priority."),
    ("Socket in the living room not working, not charging appliances.", "Electrical", "Low", "Single wall outlet malfunction is a minor repair item."),
    ("Electric vehicle charger in parking spot 24 is not powering up.", "Electrical", "Medium", "EV charging failure is a medium priority convenience disruption for EV owners."),
    
    # Elevator
    ("Elevator B in Wing C is shaking violently and making a grinding noise.", "Elevator", "High", "Violent elevator shaking indicates critical mechanical failure and safety risk."),
    ("Elevator A is stuck on floor 3 with doors refusing to open.", "Elevator", "High", "Passenger entrapment or stuck elevator is a critical emergency status."),
    ("The floor indicator display inside Elevator C is blank.", "Elevator", "Low", "Indicator screen outage is a minor cosmetic display issue."),
    ("Elevator buttons for floor 7 are not responding to touch.", "Elevator", "Medium", "Partially unresponsive elevator buttons disrupt service for residents."),
    ("Elevator is making squeaking sounds during movement.", "Elevator", "Medium", "Squeaking sounds indicate lubrication or alignment need, a medium maintenance risk."),

    # Cleanliness
    ("Garbage bins at the main gate are overflowing and smelling bad.", "Cleanliness", "Medium", "Overflowing waste bins pose a public health hazard and visual nuisance."),
    ("Staircase of Wing B hasn't been swept or mopped for 3 days, very dusty.", "Cleanliness", "Low", "Routine cleaning backlog is classified as a low priority maintenance task."),
    ("Dog poop left unattended in the central kids play park.", "Cleanliness", "Medium", "Pet waste in children's play area is a hygiene issue requiring medium priority clean-up."),
    ("Spilled oil on the ramp entering the basement parking, extremely slippery.", "Cleanliness", "High", "Slippery oil spill on a vehicle ramp is a high priority safety hazard for vehicles/pedestrians."),
    ("Dry leaves accumulated in the swimming pool area.", "Cleanliness", "Low", "Accumulated leaves in pool area are a minor seasonal cleanup item."),

    # Security
    ("Main gate intercom connection to Wing A is not connecting calls.", "Security", "Medium", "Intercom failure degrades visitor validation and compromises building security."),
    ("CCTV camera at the entry gate is facing downwards and not recording faces.", "Security", "High", "Blind spot in primary entry gate CCTV is a severe security vulnerability."),
    ("Security guard found sleeping at the backdoor checkpoint post.", "Security", "High", "Sleeping guard at active checkpoint is a critical security breach."),
    ("Lobby glass door lock is broken and does not latch properly.", "Security", "High", "Broken lobby door latch allows unauthorized building entry, a high priority threat."),
    ("Visitor registration logbook is torn and missing pages.", "Security", "Low", "Torn logbook is a minor administrative recordkeeping issue.")
]

# Initialize and train local models on import
texts = [item[0] for item in TRAINING_DATA]
categories = [item[1] for item in TRAINING_DATA]
priorities = [item[2] for item in TRAINING_DATA]

vectorizer = TfidfVectorizer(stop_words='english', lowercase=True, ngram_range=(1, 2))
X_train = vectorizer.fit_transform(texts)

clf_category = LogisticRegression(C=1.0, random_state=42)
clf_category.fit(X_train, categories)

clf_priority = LogisticRegression(C=1.0, random_state=42)
clf_priority.fit(X_train, priorities)

def predict_complaint_attributes(title: str, description: str) -> Dict[str, Any]:
    """
    Predicts complaint Category and Priority using local NLP models.
    Provides confidence score and an explainable reasoning text.
    """
    full_text = f"{title}. {description}"
    vec = vectorizer.transform([full_text])
    
    # Predict Category
    cat_pred = clf_category.predict(vec)[0]
    cat_probs = clf_category.predict_proba(vec)[0]
    cat_idx = list(clf_category.classes_).index(cat_pred)
    cat_conf = float(cat_probs[cat_idx])
    
    # Predict Priority
    pri_pred = clf_priority.predict(vec)[0]
    pri_probs = clf_priority.predict_proba(vec)[0]
    pri_idx = list(clf_priority.classes_).index(pri_pred)
    pri_conf = float(pri_probs[pri_idx])
    
    # Select explanation from matches or construct dynamic one
    explanation = ""
    for text_sample, cat_sample, pri_sample, expl_sample in TRAINING_DATA:
        # If there is a high overlap keyword, borrow explanation
        words = set(re.findall(r'\w+', text_sample.lower()))
        query_words = set(re.findall(r'\w+', full_text.lower()))
        overlap = len(words.intersection(query_words))
        if overlap >= 3 and cat_sample == cat_pred:
            explanation = expl_sample
            break
            
    if not explanation:
        explanation = f"AI classified this under '{cat_pred}' category with {cat_conf:.0%} confidence based on key terms. Priority set to '{pri_pred}' due to implied safety and service disruption levels."
        
    return {
        "category": cat_pred,
        "priority": pri_pred,
        "confidence_score": round((cat_conf + pri_conf) / 2.0, 2),
        "explanation": explanation
    }

# -----------------
# 2. Recurring Complaint Detector
# -----------------
def detect_recurring_complaint(new_description: str, existing_complaints: List[Any], threshold: float = 0.60) -> Tuple[bool, Optional[int]]:
    """
    Uses TF-IDF and Cosine Similarity to detect similar/duplicate complaints.
    Returns: (is_recurring, parent_complaint_id)
    """
    if not existing_complaints:
        return False, None
        
    corpus = [new_description] + [c.description for c in existing_complaints]
    
    try:
        temp_vec = TfidfVectorizer(stop_words='english')
        tfidf_matrix = temp_vec.fit_transform(corpus)
        
        # Calculate similarity between new complaint (index 0) and all others
        new_vec = tfidf_matrix[0]
        others_matrix = tfidf_matrix[1:]
        
        # Cosine similarity calculation: (A . B) / (||A|| ||B||)
        from sklearn.metrics.pairwise import cosine_similarity
        similarities = cosine_similarity(new_vec, others_matrix)[0]
        
        max_idx = np.argmax(similarities)
        max_sim = similarities[max_idx]
        
        if max_sim >= threshold:
            parent_complaint = existing_complaints[max_idx]
            # Link to the oldest complaint or the parent of that one to maintain flat thread structure
            parent_id = parent_complaint.parent_recurring_complaint_id or parent_complaint.id
            return True, parent_id
    except Exception:
        pass
        
    return False, None

# -----------------
# 3. Asset Risk Scoring (Predictive Maintenance)
# -----------------
def calculate_asset_risk(asset: Any, complaints_list: List[Any]) -> Dict[str, Any]:
    """
    Calculates health score, risk score, and risk level of an asset.
    Considers asset age, last maintenance date, and frequency of related complaints.
    """
    # 1. Base score starts at 100 health
    health_deductions = 0.0
    
    # 2. Age factor (older assets decay health)
    today = datetime.datetime.utcnow().date()
    # Handle both date and datetime
    install_date = asset.install_date.date() if isinstance(asset.install_date, datetime.datetime) else asset.install_date
    age_days = (today - install_date).days
    age_years = age_days / 365.0
    
    # Deduct 2% health per year of age (capped at 30%)
    health_deductions += min(age_years * 2.5, 30.0)
    
    # 3. Last maintenance factor
    maint_date = asset.last_maintenance_date.date() if isinstance(asset.last_maintenance_date, datetime.datetime) else asset.last_maintenance_date
    days_since_maint = (today - maint_date).days
    
    # If not maintained for over 180 days, deduct health
    if days_since_maint > 180:
        overdue_days = days_since_maint - 180
        health_deductions += min((overdue_days / 30.0) * 4.0, 25.0)  # max 25% penalty
        
    # 4. History of active/resolved complaints matching asset category/name
    matching_complaints = [
        c for c in complaints_list 
        if asset.category.lower() in c.category.lower() or asset.name.lower() in c.description.lower() or asset.location.lower() in c.location.lower()
    ]
    
    recent_failures = len(matching_complaints)
    # Deduct 8% health per historical complaint (max 40% penalty)
    health_deductions += min(recent_failures * 8.0, 40.0)
    
    # Health score is bounded [10, 100]
    health_score = max(100.0 - health_deductions, 10.0)
    
    # Risk score is inverse of health
    risk_score = 100.0 - health_score
    
    # Risk level categorization
    if risk_score < 30:
        risk_level = "Low"
    elif risk_score < 70:
        risk_level = "Medium"
    else:
        risk_level = "High"
        
    # Explanations / recommendations
    recommendation = "Normal operations. Scheduled checks."
    if risk_level == "High":
        recommendation = "CRITICAL: Urgent maintenance requested. Multiple complaints filed or long service interval."
    elif risk_level == "Medium":
        recommendation = "RECOMMENDED: Plan inspections in next 14 days. Age decay or minor pending issues."
        
    return {
        "health_score": round(health_score, 1),
        "risk_score": round(risk_score, 1),
        "risk_level": risk_level,
        "recommendation": recommendation
    }

# -----------------
# 4. Complaint Volume Forecasting
# -----------------
def forecast_complaint_volume(complaints_list: List[Any], days_to_forecast: int = 30) -> List[Dict[str, Any]]:
    """
    Fits a simple regression model to historical daily complaint volumes.
    Forecasts volumes for the next 30 days based strictly on filed complaints.
    """
    today = datetime.datetime.utcnow().date()
    
    # If no complaints exist, forecast is strictly 0
    if not complaints_list:
        return [
            {"date": (today + datetime.timedelta(days=i)).strftime("%Y-%m-%d"), "count": 0}
            for i in range(1, days_to_forecast + 1)
        ]
        
    # Aggregate complaints by date
    dates = []
    for c in complaints_list:
        created_date = c.created_at.date() if isinstance(c.created_at, datetime.datetime) else c.created_at
        dates.append(created_date)
        
    df = pd.DataFrame({"date": dates})
    df["count"] = 1
    df_grouped = df.groupby("date").sum().reset_index()
    
    if df_grouped.empty:
        return [
            {"date": (today + datetime.timedelta(days=i)).strftime("%Y-%m-%d"), "count": 0}
            for i in range(1, days_to_forecast + 1)
        ]
        
    min_date = df_grouped["date"].min()
    max_date = df_grouped["date"].max()
    all_dates = pd.date_range(start=min_date, end=max_date, freq='D').date
    
    full_df = pd.DataFrame({"date": all_dates})
    full_df = full_df.merge(df_grouped, on="date", how="left").fillna(0)
    
    x = np.arange(len(full_df))
    y = full_df["count"].values
    mean_y = float(np.mean(y)) if len(y) > 0 else 0.0
    
    # Fit regression if we have at least 2 days of data, else flat line at average
    if len(x) >= 2:
        try:
            slope, intercept = np.polyfit(x, y, 1)
        except Exception:
            slope, intercept = 0.0, mean_y
    else:
        slope, intercept = 0.0, mean_y
        
    # Project into future
    forecast_results = []
    last_idx = len(full_df)
    last_date = full_df["date"].max() if not full_df.empty else today
    
    for i in range(1, days_to_forecast + 1):
        future_date = last_date + datetime.timedelta(days=i)
        future_idx = last_idx + i
        
        # Calculate trend based on actual regression parameters
        trend = slope * future_idx + intercept
        
        # Seasonality component: scale based on actual mean daily complaints (no random noise)
        day_of_week = future_date.weekday()
        # Seasonality adds/subtracts up to 20% of the mean daily volume based on weekly cycle
        seasonality = 0.2 * mean_y * np.sin(2 * np.pi * day_of_week / 7.0)
        
        pred_value = max(0.0, trend + seasonality)
        
        forecast_results.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "count": int(round(pred_value))
        })
        
    return forecast_results

# -----------------
# 5. Image Analyzer
# -----------------
def analyze_uploaded_photo(photo_url: str) -> Dict[str, Any]:
    """
    Simulates a vision system scanning complaint photos.
    Deduces findings like cracks, rust, wire sparks.
    """
    findings = "Analysis of visual attributes completed."
    detected_severity = "Low"
    ai_suggestions = "Standard operations."
    
    # Match keywords in filename for smart mocks
    photo_lower = photo_url.lower()
    if "leak" in photo_lower or "water" in photo_lower or "pipe" in photo_lower:
        findings = "Visual system detected fluid moisture, rust deposits, and damp walls indicating a slow-drip pipe joint leak."
        detected_severity = "Medium"
        ai_suggestions = "Turn off the closest sub-valve and inspect the pipe coupling gasket."
    elif "spark" in photo_lower or "wire" in photo_lower or "burn" in photo_lower or "meter" in photo_lower:
        findings = "Visual scanning detected carbon scoring, melted insulation wrap, and exposed copper conductors with soot build-up."
        detected_severity = "High"
        ai_suggestions = "Isolate circuit breaker, tag out panel, and dispatch master electrician immediately."
    elif "lift" in photo_lower or "elevator" in photo_lower or "door" in photo_lower:
        findings = "Visual scan shows misaligned door track grooves and debris obstruction."
        detected_severity = "Medium"
        ai_suggestions = "Vacuum lock tracks and inspect photoelectric sensor alignment."
    elif "garbage" in photo_lower or "trash" in photo_lower or "smell" in photo_lower:
        findings = "Visual scan detects overflowed green collection bins and plastic refuse scattered on floor."
        detected_severity = "Low"
        ai_suggestions = "Clean floor with chemical disinfectants and clear overflow bins."
        
    return {
        "findings": findings,
        "severity": detected_severity,
        "recommendations": ai_suggestions,
        "scanned_at": datetime.datetime.utcnow().isoformat()
    }

# -----------------
# 6. Admin AI Assistant (RAG Chatbot)
# -----------------
class LocalRAGAssistant:
    """
    A context-aware Q&A assistant indexing society database records.
    Filters relevant facts using quick TF-IDF ranking.
    """
    def __init__(self, db_session: Any):
        self.db = db_session
        
    def query(self, user_question: str) -> Tuple[str, List[str]]:
        from models import Complaint, Asset, Notice, User
        import pandas as pd
        import numpy as np
        
        # 1. Pull data from DB
        complaints = self.db.query(Complaint).all()
        assets = self.db.query(Asset).all()
        notices = self.db.query(Notice).all()
        
        q_lower = user_question.lower()
        
        # Greetings check
        greetings = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "who are you", "what is your name"]
        if any(greet in q_lower for greet in greetings):
            return (
                "Hello! I am the Nivasa AI Operations Assistant. How can I help you manage complaints, notices, or assets today?",
                ["View Complaints List", "Check Asset Health"]
            )
            
        # Domain keyword validation
        domain_keywords = [
            "complaint", "ticket", "maintenance", "notice", "asset", "risk", "water", "pipe", 
            "elevator", "leak", "security", "electricity", "flat", "society", "building", 
            "system", "log", "user", "admin", "issue", "problem", "fault", "defect", "repair",
            "boiler", "pump", "generator", "bulletin", "board", "alert", "SLA", "priority", 
            "status", "open", "progress", "resolved", "analyt", "forecast", "nlp", "rag"
        ]
        is_domain = any(keyword in q_lower for keyword in domain_keywords)
        if not is_domain:
            return (
                "I am the Nivasa Operations Assistant, specialized in managing complaints, notice bulletins, and asset risks for this estate. I am unable to answer general questions outside of property operations.",
                ["Check Dashboard Analytics"]
            )

        # Keyword matching answers:
        # A. Specific Complaint status / counting checks
        if "open" in q_lower and ("complaint" in q_lower or "ticket" in q_lower or "issue" in q_lower):
            open_list = [c for c in complaints if c.status == "Open"]
            count = len(open_list)
            if count > 0:
                response = f"There are currently **{count} open complaints**:\n"
                for c in open_list[:5]:
                    response += f"- **ID {c.id}**: {c.title} (Location: {c.location}, Priority: {c.priority})\n"
                if count > 5:
                    response += f"- *And {count - 5} more...*"
                actions = ["Manage Tickets"]
            else:
                response = "There are no open complaints in the system right now!"
                actions = ["View Complaints List"]
            return response, actions

        if "resolved" in q_lower and ("complaint" in q_lower or "ticket" in q_lower or "issue" in q_lower):
            resolved_list = [c for c in complaints if c.status == "Resolved"]
            count = len(resolved_list)
            if count > 0:
                response = f"There are **{count} resolved complaints** in the database.\n"
                for c in resolved_list[:5]:
                    response += f"- **ID {c.id}**: {c.title} (Location: {c.location}, Category: {c.category})\n"
                actions = ["View Complaints List"]
            else:
                response = "No complaints have been marked as resolved yet."
                actions = ["View Complaints List"]
            return response, actions

        if "how many complaints" in q_lower or "total complaints" in q_lower:
            total = len(complaints)
            open_c = len([c for c in complaints if c.status == "Open"])
            prog_c = len([c for c in complaints if c.status == "In Progress"])
            res_c = len([c for c in complaints if c.status == "Resolved"])
            response = (
                f"There are currently **{total} total complaints** in the system:\n"
                f"- **Open**: {open_c}\n"
                f"- **In Progress**: {prog_c}\n"
                f"- **Resolved**: {res_c}"
            )
            actions = ["Manage Tickets", "Check Analytics Dashboard"]
            return response, actions

        # B. Asset / Maintenance checks
        if "risk" in q_lower or "asset" in q_lower or "maintenance" in q_lower:
            high_risk = []
            for asset in assets:
                risk_data = calculate_asset_risk(asset, complaints)
                if risk_data["risk_level"] == "High":
                    high_risk.append(f"**{asset.name}** in {asset.location} (Score: {risk_data['risk_score']} - {risk_data['recommendation']})")
            
            if high_risk:
                response = "The following society assets are flag-marked as **High Risk** and need immediate attention:\n\n" + "\n".join([f"- {item}" for item in high_risk])
                actions = ["Inspect High Risk Assets", "View Assets Portal"]
            else:
                response = "All society assets are currently running in **Low** or **Medium** risk levels. No critical maintenance items are overdue."
                actions = ["View Assets Portal"]
            return response, actions
            
        if "recurring" in q_lower or "repeating" in q_lower:
            rec_c = [c for c in complaints if c.is_recurring]
            if rec_c:
                response = f"I detected **{len(rec_c)} recurring issues** in the system. The most common repeated categories are:\n"
                cat_counts = pd.Series([c.category for c in rec_c]).value_counts()
                for cat, val in cat_counts.items():
                    response += f"- **{cat}**: {val} repetitions.\n"
                response += "\nAdmins are recommended to replace corresponding components rather than applying temporary repairs."
                actions = ["Review Recurring Issues", "Inspect High Risk Assets"]
            else:
                response = "No recurring complaints have been flagged in the database yet."
                actions = ["View Complaints List"]
            return response, actions

        if "notice" in q_lower or "pinned" in q_lower:
            pins = [n for n in notices if n.is_pinned or n.is_important]
            if pins:
                response = "Here are the pinned/important active notices on the board:\n\n"
                for pin in pins:
                    response += f"- **{pin.title}**: {pin.content[:100]}...\n"
                actions = ["Create New Notice", "Go to Notice Board"]
            else:
                response = "There are no pinned or important notices posted at this time."
                actions = ["Create New Notice"]
            return response, actions
            
        # C. Keyword search match (specific lookup fallback)
        # Search complaints by matching words
        words = q_lower.split()
        search_words = [w for w in words if w not in ["the", "a", "an", "is", "are", "what", "find", "search", "show", "tell", "about", "status", "of"]]
        if search_words:
            matched_c = []
            for c in complaints:
                if any(sw in c.title.lower() or sw in c.description.lower() for sw in search_words):
                    matched_c.append(c)
            if matched_c:
                response = f"I found **{len(matched_c)} matching complaints**:\n\n"
                for c in matched_c[:3]:
                    response += f"- **{c.title}** (ID: {c.id}, Location: {c.location}, Status: **{c.status}**)\n"
                    response += f"  *Description: {c.description}*\n\n"
                actions = ["Manage Tickets"]
                return response, actions

        # General corpus search using similarity
        corpus = []
        mapping = []
        
        for c in complaints:
            corpus.append(f"Complaint: {c.title}. Description: {c.description}. Location: {c.location}. Status: {c.status}.")
            mapping.append(("complaint", c.id, c.title))
            
        for a in assets:
            corpus.append(f"Asset: {a.name}. Category: {a.category}. Location: {a.location}. Status: {a.status}.")
            mapping.append(("asset", a.id, a.name))
            
        for n in notices:
            corpus.append(f"Notice: {n.title}. Content: {n.content}.")
            mapping.append(("notice", n.id, n.title))
            
        if not corpus:
            return "The database is currently empty. Please run seeding script or create items to ask detailed questions.", []
            
        try:
            temp_vec = TfidfVectorizer(stop_words='english')
            matrix = temp_vec.fit_transform([user_question] + corpus)
            
            from sklearn.metrics.pairwise import cosine_similarity
            sims = cosine_similarity(matrix[0], matrix[1:])[0]
            
            top_indices = np.argsort(sims)[::-1][:3]
            results = []
            
            for idx in top_indices:
                if sims[idx] > 0.05:
                    results.append(corpus[idx])
                    
            if results:
                response = f"Based on the system records, here is the relevant context I found:\n\n"
                for res in results:
                    response += f"- {res}\n"
                response += "\nWould you like me to take any actions or retrieve specific files?"
                suggested_actions = ["Go to Complaints", "Manage Notices"]
            else:
                response = "I couldn't find any direct records matching your query. Try asking about 'total complaints', 'high risk assets', or 'notice board'."
                suggested_actions = ["Check Dashboard Analytics"]
        except Exception as e:
            response = f"An error occurred while compiling query results: {str(e)}"
            suggested_actions = []
            
        return response, suggested_actions
