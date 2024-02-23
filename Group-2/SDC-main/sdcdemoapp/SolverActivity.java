package com.example.sdcdemoapp;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import com.example.sdcdemoapp.Adapters.AnswerAdapter;
import com.example.sdcdemoapp.Adapters.MainAdapter;
import com.example.sdcdemoapp.Models.Span;

import java.util.ArrayList;

public class SolverActivity extends AppCompatActivity {
    EditText spanCount;
    ImageView check, solve_button;
    RecyclerView solverRV;
    static ArrayList<Span> spanList = new ArrayList<>();
    MainAdapter adapter;
    AlertDialog answerDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_solver);
        initViews();

        check.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                spanList.clear();
                int j = 1;
                int id = 0;
                int spans = Integer.parseInt(spanCount.getText().toString());
                while (j <= spans){
                    Span span = new Span(id);
                    spanList.add(span);
                    j++;
                    id++;
                }
                adapter = new MainAdapter(v.getContext(), spanList);
                solverRV.setAdapter(adapter);
                solverRV.setHasFixedSize(true);
                solverRV.setLayoutManager(new LinearLayoutManager(v.getContext(), RecyclerView.VERTICAL, false));
            }
        });

        solve_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                android.app.AlertDialog.Builder dialogBuilder = new android.app.AlertDialog.Builder(v.getContext());
                View dialogView = LayoutInflater.from(v.getContext()).inflate(R.layout.answers_layout, null);
                dialogBuilder.setView(dialogView);
                answerDialog = dialogBuilder.create();

                RecyclerView answerRV = dialogView.findViewById(R.id.answer_RV);
                answerRV.setHasFixedSize(true);
                answerRV.setLayoutManager(new LinearLayoutManager(getApplicationContext(), RecyclerView.VERTICAL, false));
                AnswerAdapter answerAdapter = new AnswerAdapter(getApplicationContext(), spanList);
                answerRV.setAdapter(answerAdapter);

                if(spanList.size() == 2){
                    solveFor2(spanList);
                }

                if(spanList.size() == 3){
                    solveFor3(spanList);
                }

                if(spanList.size() > 3){
                    solveForAll(spanList);
                }

                answerDialog.show();
            }
        });
    }

    private void solveForAll(ArrayList<Span> spanList) {
        int i = 0;
        while (i < spanList.size()){
            i++;
        }
    }

    private void solveFor2(ArrayList<Span> spanList) {
        float x = 0;
        Span span1 = spanList.get(0);
        Span span2 = spanList.get(1);

        x = (span1.getC_right() + span2.getC_left()) * -1 / (span1.getB_right() + span2.getA_left());
        Toast.makeText(getApplicationContext(), String.valueOf(x), Toast.LENGTH_SHORT).show();

        spanList.get(0).setLeftMoment(span1.getC_left() + (span1.getB_left() * x));
        spanList.get(0).setRightMoment(span1.getC_right() + (span1.getB_right() * x));

        spanList.get(1).setLeftMoment(span2.getC_left() + (span2.getA_left() * x));
        spanList.get(1).setRightMoment(span2.getC_right() + (span2.getA_right() * x));
    }

    private void solveFor3(ArrayList<Span> spanList) {
        float a1, b1, c1, a2, b2, c2, determinant, determinantX, determinantY, x = 0, y = 0;
        Span span1 = spanList.get(0);
        Span span2 = spanList.get(1);
        Span span3 = spanList.get(2);

        a1 = span1.getB_right() + span2.getA_left();
        b1 = span2.getB_left();
//        c1 = span1.getC_left() + span2.getC_right();
        c1 = span1.getC_right() + span2.getC_left();

        a2 = span2.getA_right();
        b2 = span2.getB_right() + span3.getA_left();
//        c2 = span2.getC_left() + span3.getC_right();
        c2 = span2.getC_right() + span3.getC_left();

        determinant = a1 * b2 - a2 * b1;
        determinantX = c1 * b2 - c2 * b1;
        determinantY = a1 * c2 - a2 * c1;

//        determinant = a1 * b2 - a2 * b1;
//        determinantX = c1 * b2 - c2 * a2;
//        determinantY = a1 * c2 - b1 * c1;

        if(determinant != 0){
            x = determinantX / determinant;
            y = determinantY / determinant;
        }

        Toast.makeText(getApplicationContext(), String.valueOf(c1), Toast.LENGTH_SHORT).show();

        spanList.get(0).setLeftMoment(span1.getC_left() + span1.getB_left() * x);
        spanList.get(0).setRightMoment(span1.getC_right() + span1.getB_right() * x);

        spanList.get(1).setLeftMoment(span2.getC_left() + (span2.getA_left() * x) + (span2.getB_left() * y));
        spanList.get(1).setRightMoment(span2.getC_right() + (span2.getA_right() * x) + (span2.getB_right() * y));

        spanList.get(2).setLeftMoment(span3.getC_left() + span3.getA_left() * y);
        spanList.get(2).setRightMoment(span3.getC_right() + span3.getA_right() * y);
    }

    private void initViews() {
        spanCount = findViewById(R.id.span_count);
        check = findViewById(R.id.check_btn);
        solverRV = findViewById(R.id.solver_rv);
        solve_button = findViewById(R.id.solve_btn);
    }
}