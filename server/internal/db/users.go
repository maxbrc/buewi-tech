package db

import "fmt"

type RawUser struct {
	ID           int
	FirstName    string
	LastName     string
	EMail        string
	RoleID       int
	Argon2IDHash string
	CreatedAt    string
	Username     string
	Tel          string
}

type RawUserInsert struct {
	FirstName    string
	LastName     string
	EMail        string
	RoleID       int
	Argon2IDHash string
	Username     string
	Tel          string
}

func GetUserByUsername(username string) (*RawUser, error) {
	rows, err := db.Query("SELECT * FROM users WHERE username = ?", username)
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	rowAvailable := rows.Next()
	if !rowAvailable {
		return nil, fmt.Errorf("no such user")
	}

	var user RawUser
	err = rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.EMail, &user.RoleID, &user.Argon2IDHash, &user.CreatedAt, &user.Username, &user.Tel)
	if err != nil {
		return nil, fmt.Errorf("failed to scan row: %v", err)
	}

	return &user, nil
}

func GetUserByID(id int) (*RawUser, error) {
	rows, err := db.Query("SELECT * FROM users WHERE id = ?", id)
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	rowAvailable := rows.Next()
	if !rowAvailable {
		return nil, fmt.Errorf("no such user")
	}

	var user RawUser
	err = rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.EMail, &user.RoleID, &user.Argon2IDHash, &user.CreatedAt, &user.Username, &user.Tel)
	if err != nil {
		return nil, fmt.Errorf("failed to scan row: %v", err)
	}

	return &user, nil
}

func InsertUser(rawUser *RawUserInsert) error {
	_, err := db.Exec("INSERT INTO users (first_name, last_name, email, role_id, argon2id_hash, username, tel) VALUES (?, ?, ?, ?, ?, ?, ?)", rawUser.FirstName, rawUser.LastName, rawUser.EMail, rawUser.RoleID, rawUser.Argon2IDHash, rawUser.Username, rawUser.Tel)
	if err != nil {
		return fmt.Errorf("failed to exec db: %v", err)
	}

	return nil
}

func GetUsers() ([]*RawUser, error) {
	rows, err := db.Query("SELECT * FROM users")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	var users []*RawUser
	for rows.Next() {
		var user RawUser
		err = rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.EMail, &user.RoleID, &user.Argon2IDHash, &user.CreatedAt, &user.Username, &user.Tel)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		users = append(users, &user)
	}

	return users, nil
}
