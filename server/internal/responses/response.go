package responses

import (
	"encoding/json"
	"net/http"
	"time"
)

type Response struct {
	Content      *any   `json:"content"`
	TimestampUTC string `json:"timestamp_utc"`
}

func HandleRequest(w http.ResponseWriter, r *http.Request, v any) {
	response := Response{
		Content:      &v,
		TimestampUTC: time.Now().UTC().Format(time.RFC3339),
	}

	json.NewEncoder(w).Encode(response)
}
