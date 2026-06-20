package com.example.librarymanagementservice.service;

import com.example.librarymanagementservice.model.Book;
import com.example.librarymanagementservice.repository.BookRepository;
import org.aspectj.weaver.loadtime.definition.LightXMLParser;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public Book save(Book book) {
        return bookRepository.save(book);
    }

    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }

    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    public List<Book> findAllAvailable() {return bookRepository.findAllAvailable();}

    public void deleteById(Long id) {
        bookRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return bookRepository.existsById(id);
    }

    public List<Book> searchByKeyword(String keyword) {
        return bookRepository.searchByKeyword(keyword.toLowerCase());
    }

    public List<Map<String, Object>> getTopActiveUsers() {
        List<Object[]> results = bookRepository.findTopActiveUsers();

        return results.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("userEmail", row[0]);
                    map.put("booksFetched", row[1]);
                    return map;
                })
                .collect(Collectors.toList());
    }

}
