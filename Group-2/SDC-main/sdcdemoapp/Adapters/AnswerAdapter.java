package com.example.sdcdemoapp.Adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.sdcdemoapp.Models.Span;
import com.example.sdcdemoapp.R;

import java.util.ArrayList;

public class AnswerAdapter extends RecyclerView.Adapter<AnswerAdapter.MyviewHolder> {
    Context context;
    ArrayList<Span> spans;

    public AnswerAdapter(Context context, ArrayList<Span> spans){
        this.context = context;
        this.spans = spans;
    }

    @NonNull
    @Override
    public AnswerAdapter.MyviewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.answer_item, parent, false);
        return new AnswerAdapter.MyviewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull AnswerAdapter.MyviewHolder holder, int position) {
        holder.span_Id.setText("Span " + String.valueOf(spans.get(position).getId() + 1) + " moments");
        holder.moment_RL.setText(spans.get(position).getC_right() + " + " + spans.get(position).getA_right() + "EI<r + " + spans.get(position).getB_right() + "EI<l");
        holder.momentRL_val.setText("M = " + String.valueOf(spans.get(position).getRightMoment()));
        holder.moment_LR.setText(spans.get(position).getC_left() + " + " + spans.get(position).getA_left() + "EI<r + " + spans.get(position).getB_left() + "EI<l");
        holder.momentLR_val.setText("M = " + String.valueOf(spans.get(position).getLeftMoment()));
    }

    @Override
    public int getItemCount() {
        return spans.size();
    }

    public class MyviewHolder extends RecyclerView.ViewHolder {
        TextView span_Id, moment_LR, moment_RL, momentLR_val, momentRL_val;
        public MyviewHolder(@NonNull View itemView) {
            super(itemView);
            span_Id = itemView.findViewById(R.id.span_id);
            moment_LR = itemView.findViewById(R.id.moment_LR);
            moment_RL = itemView.findViewById(R.id.moment_RL);
            momentLR_val = itemView.findViewById(R.id.momentLR_val);
            momentRL_val = itemView.findViewById(R.id.momentRL_val);
        }
    }
}
