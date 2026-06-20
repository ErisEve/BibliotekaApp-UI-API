package com.example.librarymanagementservice.repository;

import com.example.librarymanagementservice.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    @Query(value = """
    SELECT * FROM books
    WHERE LOWER(title) LIKE %:keyword% OR LOWER(description) LIKE %:keyword% OR LOWER(author) LIKE %:keyword% OR isbn LIKE %:keyword%""", nativeQuery = true)
    List<Book> searchByKeyword(@Param("keyword") String keyword);


    @Query(value = """
    SELECT fetched_by AS userEmail, COUNT(*) AS booksFetched
    FROM books
    WHERE fetched_by IS NOT NULL
    GROUP BY fetched_by
    ORDER BY booksFetched DESC
    """, nativeQuery = true)
    List<Object[]> findTopActiveUsers();

    @Query(value = """
    SELECT *
    FROM books
    WHERE id NOT IN (SELECT book_id FROM lending)
    """, nativeQuery = true)
    List<Book> findAllAvailable();


    // Find books with titles containing the given string
//    List<Book> findByTitleContaining(String titlePart);

    // Find books by the exact author name
//    List<Book> findByAuthor(String author);
}
