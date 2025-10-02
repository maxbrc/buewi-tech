package db

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/bm-dynamics/buewi-tech/server/config"
	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func InitClient() error {
	var err error
	db, err = sql.Open("mysql", config.AppConfig.MySQLConnectionString)
	if err != nil {
		return fmt.Errorf("failed to open database connection: %v", err)
	}

	err = db.Ping()
	if err != nil {
		return fmt.Errorf("failed to ping database: %v", err)
	}

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	return nil
}
