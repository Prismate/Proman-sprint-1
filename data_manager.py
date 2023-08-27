import os
import psycopg2
import psycopg2.extras


def establish_connection(connection_data=None):
    """
    Create a database connection based on the :connection_data: parameter
    :connection_data: Connection string attributes
    :returns: psycopg2.connection
    """
    if connection_data is None:
        connection_data = get_connection_data()
    try:
        connect_str = "dbname={} user={} host={} password={}".format(connection_data['dbname'],
                                                                     connection_data['user'],
                                                                     connection_data['host'],
                                                                     connection_data['password'])
        conn = psycopg2.connect(connect_str)
        conn.autocommit = True
    except psycopg2.DatabaseError as e:
        print("Cannot connect to database.")
        print(e)
    else:
        return conn


def get_connection_data(db_name=None):
    """
    Give back a properly formatted dictionary based on the environment variables values which are started
    with :MY__PSQL_: prefix
    :db_name: optional parameter. By default it uses the environment variable value.
    """
    if db_name is None:
        db_name = 'postgres'

    return {
        'dbname': 'justyna_pro_man',
        'user': 'postgres',
        'host': 'localhost',
        'password': 'Martynka22!'
    }


def execute_select(statement, variables=None, fetchall=True):
    """
    Execute SELECT statement optionally parameterized.
    Use fetchall=False to get back one value (fetchone)

    Example:
    > execute_select('SELECT %(title)s; FROM shows', variables={'title': 'Codecool'})
    statement: SELECT statement
    variables:  optional parameter dict, optional parameter fetchall"""
    result_set = []
    with establish_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(statement, variables)
            result_set = cursor.fetchall() if fetchall else cursor.fetchone()
    return result_set


def execute_modify(statement, variables=None):
    """
    Execute statement (INSERT, UPDATE or DELETE) optionally parameterized.
    ...
    """
    print("Starting execute_modify in data_manager...")
    print(f"Statement: {statement}")
    print(f"Variables: {variables}")

    try:
        with establish_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(statement, variables)
                print("Successfully executed statement in execute_modify.")

                if "RETURNING" in statement:
                    result = cursor.fetchone()
                    print(f"Result from RETURNING: {result}")
                    if result:
                        return result[0]  # Zwróć pierwszy element z krotki
                    return None

                # Jeśli operacja się powiodła, ale nie było klauzuli RETURNING, zwróć True
                return True

    except Exception as e:
        print("Error in execute_modify in data_manager:", e)
        return None